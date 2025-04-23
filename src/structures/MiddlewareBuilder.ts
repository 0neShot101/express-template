import type { 
  Request, 
  Response, 
  NextFunction, 
} from 'express';

type Middleware = (req: Request, res: Response, next: NextFunction) => any

export default class MiddlewareBuilder {
  private middlewares: Middleware[];

  /**
   * Register one or more middleware functions.
   * @param middlewares Middleware functions to invoke first.
   */
  constructor(...middlewares: Middleware[]) {
    this.middlewares = [...middlewares];
  };

  /**
   * Compose registered middleware with a final handler.
   * @param handler The “real” request handler to run last.
   * @returns A single Express middleware.
   */
  public build(handler: Middleware): Middleware {
    if (typeof handler !== 'function')
      throw new Error('Handler must be a function');

    return async (req, res, next) => {
      try {
        const run = (mw: Middleware) =>
          new Promise<void>((resolve, reject) =>
            mw(req, res, err => (err ? reject(err) : resolve())),
          );

        for (const mw of this.middlewares)
          await run(mw);

        handler(req, res, next);
      } catch (err) {
        next(err);
      };
    };
  };
};
