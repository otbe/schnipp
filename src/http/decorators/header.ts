import { getControllerMetaData } from './getControllerMetaData';
import { getMethodMetaData } from '../factories/createHttpMethodDecorator';

export const Header = (name: string, value: string) => (
  ...args: Array<any>
) => {
  const target = args[0];

  switch (args.length) {
    // class
    case 1:
      const controllerMetaData = getControllerMetaData(target);
      controllerMetaData.headers[name] = value;
      return;
    // method
    case 2:
    case 3:
      const methodMetaData = getMethodMetaData(args[1], target);
      methodMetaData.headers[name] = value;
      return args[2];
    default:
      throw 'not supported target for @Header';
  }
};
