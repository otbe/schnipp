import { ParamInjector, getMethodMetaData } from './createHttpMethodDecorator';

export const createMethodParameterDecorator = <T>(
  injector: ParamInjector<T>
): ParameterDecorator => (
  target: Object,
  propertyKey: string,
  index: number
) => {
  const methodMetaData = getMethodMetaData(propertyKey, target);

  methodMetaData.paramaters.push({
    index,
    injector
  });
};
