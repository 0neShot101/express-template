import EventEmitter from '@3xpo/events';
import Joi from 'joi';

import type { Route, RouteEvent, HttpMethod, RouteHandler, } from '../interfaces/route';
import type { ValidationSchemas, } from '../interfaces/validationSchemas';
import type { middleware, } from '../interfaces/middleware';


export default class RouteBuilder extends (EventEmitter as unknown as new () => Route) {
  public supportedMethods: Array<HttpMethod>;
  public middleware?: middleware;
  public schemas: Partial<Record<HttpMethod, ValidationSchemas>> = {};

  /**
   * @param {middleware} [middleware] - Optional middleware to be used with the route.
   */
  constructor(middleware?: middleware) {
    super();

    this.supportedMethods = [];
    this.middleware = middleware;
  };

  /**
   * Middleware to validate request data against schemas.
   * @param method - The HTTP method.
   * @returns Middleware function.
  */
  private _validateSchema(method: HttpMethod) {
    return (request, response, next) => {
      const schema = this.schemas[method];
      
      if (schema === undefined) 
        return next();

      try {
        for (const [key, validator] of Object.entries(schema) as [keyof typeof schema, any][]) {
          const { error, value, } = validator.validate(request[key]);

          if (error) 
            throw new Error(error.message);

          request[key] = value;
        };

        next();
      } catch (error) {
        response.status(400).json({ 'error': error.message, });
      };
    };
  };

  /**
   * Defines validation schemas for a specific HTTP method.
   * @param {HttpMethod} method - The HTTP method to define schemas for.
   * @param {(schema: typeof Joi) => ValidationSchemas} schemaCallback - A callback to define schemas.
   * @returns {this} The RouteBuilder instance.
   */
  public schema(method: HttpMethod, schema: (schema: typeof Joi) => ValidationSchemas): this {
    if (this.schemas[method] === undefined)
      this.schemas[method] = schema(Joi);
    else
      throw new Error(`Schemas for ${method} already exist!`);

    return this;
  };

  /**
   * Registers an event listener for a specified HTTP method.
   * Throws an error if the method is already registered.
   * @param {K} event - The HTTP method to listen for.
   * @param {RouteEvent[K]} listener - The event listener function.
   * @returns {this} The RouteBuilder instance.
   */
  public on<K extends keyof RouteEvent>(event: K, listener: RouteEvent[K]): this {
    if (this.supportedMethods.includes(event) === false)
      this.supportedMethods.push(event);
    else
      throw new Error(`Event ${event} already exists!`);

    this.middleware = {
      ...this.middleware,
      [event]: [...(this.middleware?.[event] || []), this._validateSchema(event)],
    };

    return super.on(event, listener);
  };

  /**
   * Emits an event for a specific HTTP method.
   * @param {K} event - The HTTP method event to emit.
   * @returns {RouteHandler} The route handler function.
   */
  public emit<K extends keyof RouteEvent>(event: K): RouteHandler {
    return (request, response, next) =>
      super.emit(event, request, response, next);
  };
};
