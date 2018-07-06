import { getMethodMetaData } from '../factories/createHttpMethodDecorator';

export const StatusCode = (statusCode: number): MethodDecorator => <T>(
  target: any,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => {
  const methodMetaData = getMethodMetaData(propertyKey.toString(), target);
  methodMetaData.statusCode = statusCode;
  return descriptor;
};
