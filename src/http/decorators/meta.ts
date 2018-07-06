import { getMethodMetaData } from '../factories/createHttpMethodDecorator';
import { getControllerMetaData } from '../factories/createClassDectorator';

export const Meta = <T>(key: string, value: T) => (...args: Array<any>) => {
  const target = args[0];

  switch (args.length) {
    // class
    case 1:
      const controllerMetaData = getControllerMetaData(target);
      controllerMetaData.metaData[key] = value;
      return;
    // method
    case 2:
    case 3:
      const propertyKey = args[1];
      const methodMetaData = getMethodMetaData(propertyKey, target);
      methodMetaData.metaData[key] = value;
      return args[2];
    default:
      throw 'not supported target for @Header';
  }
};
