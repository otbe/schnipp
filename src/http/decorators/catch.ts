const CATCH = Symbol('catch');

export const Catch = (...exceptions: any[]): ClassDecorator => (
  target: any
) => {
  Reflect.defineMetadata(CATCH, exceptions, target.constructor);
};

export const getCaughtExceptions = (catcher: any) =>
  Reflect.getMetadata(CATCH, catcher.constructor) || [];
