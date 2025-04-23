import path from 'path';

import express, { 
  Router,

  type Application, 
  type RequestHandler,  
} from 'express';

import cookieParser from 'cookie-parser';
import { json, } from 'body-parser';

import RouteBuilder from './structures/RouteBuilder';

import getAllFilePaths from './utils/getAllFilePaths';
import logger from './utils/logger';

const app: Application = express();
const routesFolder: string = path.join(import.meta.dirname, 'routes');

app.disable('x-powered-by');

app.set('trust proxy', 'loopback');
app.set('json spaces', 2);

app.use(cookieParser());
app.use(json());

/**
 * Initializes and sets up routes
**/
const initializeRoutes = async (): Promise<void> => {
  try {
    const routes: string[] = await getAllFilePaths(routesFolder);

    await Promise.allSettled(
      routes.map(async (routePath: string) => {
        try {
          const routeModule = await import(routePath);
          const route = routeModule.default;
          const endpoint: string = getEndpoint(routePath, routesFolder);

          if (typeof route === 'function') {
            app.use(endpoint === '/root' ? '/' : endpoint, route as Router);
            logger.info(`Registered router at ${endpoint}`);
          };

          if (route instanceof RouteBuilder) {
            for (const method of route.supportedMethods) {
              const middleware: RequestHandler[] = route.middleware?.[method] ?? [];
              const routeEndpoint: string = endpoint === '/root' ? '/' : endpoint;

              app[method](routeEndpoint, ...middleware, route.emit(method) as RequestHandler);
              logger.info(`Registered route ${method.toUpperCase()} ${routeEndpoint}`);
            };
          };
        } catch (error) {
          logger.error(`Error loading route ${routePath}:`, error);
        };
      }),
    );
    
    app.listen(8080, () => logger.info('Listening on port 8080'));
  } catch (error) {
    logger.error('Error setting up routes:', error);
  };
};

/**
 * Removes the base path and file extension from the route path.
 * If the file is called 'index.ts' or 'index.js', use the folder name as the endpoint.
 * 
 * @param routePath - The full path of the route file.
 * @param basePath - The base directory path of all routes.
 * @returns The endpoint string derived from the route path.
 */
const getEndpoint = (routePath: string, basePath: string): string => {
  const relativePath = routePath.replace(basePath, '').replace(/\\/g, '/');
  
  const isIndexFile = /\/index\.(ts|js)$/.test(relativePath);

  if (isIndexFile === true) {
    const folderPath = path.dirname(relativePath);
    
    return folderPath === '/' ? '/' : folderPath;
  };

  return relativePath.replace(/(\.ts|\.js)$/g, '');
};


export default initializeRoutes;
