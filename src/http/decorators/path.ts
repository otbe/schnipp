import {
  RestControllerData,
  getControllerMetaData
} from './getControllerMetaData';

export const Path = (basePath: string = '/'): ClassDecorator => (
  target: any
) => {
  const metaData = getControllerMetaData(target) as RestControllerData;
  metaData.basePath = basePath;
};
