import { inject } from 'simple-ts-di';
import {
  RestControllerData,
  getControllerMetaData
} from '../../decorators/getControllerMetaData';

export const Path = (basePath: string = '/'): ClassDecorator => (
  target: any
) => {
  inject()(target);
  const metaData = getControllerMetaData(target) as RestControllerData;
  metaData.basePath = basePath;
};
