import { Newable } from 'simple-ts-di';
import { Guard, ExceptionFilter } from '../..';
import {
  ControllerData,
  getControllerMetaData
} from '../../decorators/getControllerMetaData';
import { getCaughtExceptions } from '../../decorators/catch';
import {
  getMethodMetaData,
  MethodMetaData
} from '../factories/createHttpMethodDecorator';

export const Use = (...entities: Array<Newable<Guard | ExceptionFilter>>) => (
  ...args: Array<any>
) => {
  const target = args[0];

  switch (args.length) {
    // class
    case 1:
      const controllerMetaData = getControllerMetaData(target);

      processArgs(entities, controllerMetaData, target);
      return;
    // method
    case 2:
    case 3:
      const methodMetaData = getMethodMetaData(args[1], target);

      processArgs(entities, methodMetaData, target);

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
  controllerMetaData: ControllerData | MethodMetaData,
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
  metaData: MethodMetaData | ControllerData,
  guard: Newable<Guard>
) {
  metaData.guards.push(guard);
}

function addExceptionFilter(
  metaData: MethodMetaData | ControllerData,
  target: any,
  filter: Newable<ExceptionFilter>
) {
  const exceptions = getCaughtExceptions(target.constructor);
  metaData.filters.push({
    exceptions,
    filter
  });
}
