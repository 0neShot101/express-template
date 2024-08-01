import type { RouteHandler, } from './route';

type HttpMethod = 'get' | 'post' | 'put' | 'delete' | 'patch' | 'head';

export type middleware = {
  [K in HttpMethod]?: RouteHandler[];
};
