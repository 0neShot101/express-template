import path from 'path';
import { readdir } from 'fs/promises';

import express, { 
  Router,

  type Application, 
  type RequestHandler,  
} from 'express';

import cookieParser from 'cookie-parser';
import { json, } from 'body-parser';

import RouteBuilder from './structures/RouteBuilder';
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
    const routes = (await readdir(routesFolder, { 'recursive': true, 'withFileTypes': true }))
      .filter(file => file.isFile())
      .map(file => path.join(file.parentPath, file.name))

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
  const normalizedRoutePath = routePath.replace(/\\/g, '/');
  const normalizedBasePath = basePath.replace(/\\/g, '/');
  const relativePath = normalizedRoutePath.replace(normalizedBasePath, '');
  
  return `/${relativePath
    .replace(/^\/+/, '') /* Remove leading slashes */
    .replace(/_/g, '/:') /* Convert _id to /:id */
    .replace(/\/index\.(ts|js)$/, '') /* Remove /index.ts or /index.js */
    .replace(/\.(ts|js)$/, '') /* Remove .ts or .js extension */
  }`.replace(/\/+/g, '/').replace(/\/$/, '') || '/'; /* Clean up multiple slashes and trailing slash */
};

export default initializeRoutes;
