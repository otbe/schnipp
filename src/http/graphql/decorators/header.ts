import { getControllerMetaData } from '../../decorators/getControllerMetaData';
import { GraphQLController } from '../GraphQLController';

export const Header = <T extends typeof GraphQLController>(
  name: string,
  value: string
) => (target: T) => {
  const controllerMetaData = getControllerMetaData(target);
  controllerMetaData.headers[name] = value;
};
