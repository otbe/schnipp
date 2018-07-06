import { inject } from 'simple-ts-di';
import { getControllerMetaData } from '../factories/createClassDectorator';

export const Path = (basePath: string = '/'): ClassDecorator => (
  target: any
) => {
  inject()(target);
  const metaData = getControllerMetaData(target);
  metaData.basePath = basePath;
};
