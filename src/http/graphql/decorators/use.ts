import { Newable } from 'simple-ts-di';
import { Guard, ExceptionFilter } from '../..';
import {
  getControllerMetaData,
  ControllerData
} from '../../decorators/getControllerMetaData';
import { getCaughtExceptions } from '../../decorators/catch';
import { getMethodMetaData, ResolverMethodMeta } from './method';

export const Use = (...entities: Array<Newable<Guard | ExceptionFilter>>) => (
  ...args: Array<any>
) => {
  const resolver = args[0];

  switch (args.length) {
    // class
    case 1:
      const controllerMetaData = getControllerMetaData(resolver);

      processArgs(entities, controllerMetaData, resolver);
      return;
    // method
    case 2:
    case 3:
      const propertyKey = args[1];
      const methodMetaData = getMethodMetaData(resolver, propertyKey);

      processArgs(entities, methodMetaData, resolver);
      return args[2];
    default:
      throw 'not supported target for @Use';
  }
};

const isGuard = (arg: any): arg is Newable<Guard> => {
  return !!arg.prototype.canActivate;
};

const isExceptionFilter = (arg: any): arg is Newable<ExceptionFilter> => {
  return !!arg.prototype.catch;
};

function processArgs(
  entities: Newable<Guard | ExceptionFilter>[],
  controllerMetaData: ControllerData | ResolverMethodMeta<any>,
  target: any
) {
  for (const entity of entities) {
    if (isExceptionFilter(entity)) {
      addExceptionFilter(controllerMetaData, target, entity);
    } else if (isGuard(entity)) {
      addGuard(controllerMetaData, entity);
    }
  }
}

function addGuard(
  metaData: ControllerData | ResolverMethodMeta<any>,
  guard: Newable<Guard>
) {
  metaData.guards.push(guard);
}

function addExceptionFilter(
  metaData: ControllerData | ResolverMethodMeta<any>,
  target: any,
  filter: Newable<ExceptionFilter>
) {
  const exceptions = getCaughtExceptions(target.constructor);
  metaData.filters.push({
    exceptions,
    filter
  });
}
