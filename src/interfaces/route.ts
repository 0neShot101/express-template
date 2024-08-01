import { 
  type Request, 
  type Response, 
  type NextFunction, 
} from 'express';

/**
 * A custom request object that extends the Express Request object.
**/
interface CustomRequest extends Request {
  
};

export type RouteHandler = (request: CustomRequest, response: Response, next: NextFunction) => void;

export type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head';

export type RouteEvent = {
  [K in HttpMethod]?: RouteHandler;
};

export type MiddlewareMap = {
  [K in HttpMethod]?: RouteHandler[];
};

export interface Route {
  middleware?: MiddlewareMap;

  on<E extends keyof RouteEvent>(
    event: E,
    listener: RouteEvent[E]
  ): this;

  emit<E extends keyof RouteEvent>(
    event: E,
    request: CustomRequest,
    response: Response,
    next?: NextFunction
  ): RouteHandler;
};
