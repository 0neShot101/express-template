import EventEmitter from '@3xpo/events';

import type { Route, RouteEvent, HttpMethod, RouteHandler, } from '../interfaces/route';
import type { middleware, } from '../interfaces/middleware';


export default class RouteBuilder extends (EventEmitter as unknown as new () => Route) {
  public supportedMethods: Array<HttpMethod>;
  public middleware?: middleware;

  /**
   * @param {middleware} [middleware] - Optional middleware to be used with the route.
   */
  constructor(middleware?: middleware) {
    super();

    this.supportedMethods = [];
    this.middleware = middleware;
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
