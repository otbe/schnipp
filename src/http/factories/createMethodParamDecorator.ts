import { ParamInjector, getMethodMetaData } from './createHttpMethodDecorator';

export const createMethodParameterDecorator = <T>(
  injector: ParamInjector<T>
): ParameterDecorator => (
  target: Object,
  propertyKey: string | symbol,
  index: number
) => {
  const methodMetaData = getMethodMetaData(propertyKey.toString(), target);

  methodMetaData.paramaters.push({
    index,
    injector
  });
};
