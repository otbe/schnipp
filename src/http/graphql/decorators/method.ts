import { getResolverMetaData } from './resolver';
import { Newable } from 'simple-ts-di';
import { DecoratedExceptionFilter, Guard, MetaData } from '../..';
import { DocumentNode } from 'graphql';

export const METHOD = Symbol('method');

export type Fields = {
  [fieldName: string]: ResolverMethodMeta<any>;
};

export type ResolverMeta = {
  resolverMap: { [typeName: string]: Fields };
};

export type ResolverMethodMeta<T> = {
  clazz?: Newable<T>;
  methodName: string;
  filters: Array<DecoratedExceptionFilter>;
  guards: Array<Newable<Guard>>;
  metaData: MetaData;
};

export const getMethodMetaData = (target: any, methodName: string) => {
  let data: ResolverMethodMeta<any> | null = Reflect.getMetadata(
    METHOD,
    target,
    methodName
  );

  if (data == null) {
    data = {
      methodName,
      filters: [],
      guards: [],
      metaData: {}
    };

    Reflect.defineMetadata(METHOD, data, target, methodName);
  }

  return data;
};

export const createMethodDecorator = (typeName: string) => (
  fieldName: string
): MethodDecorator => <T>(
  resolver: any,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => {
  const resolverMeta = getResolverMetaData(resolver.constructor);
  resolverMeta.resolverMap[typeName] = resolverMeta.resolverMap[typeName] || {};

  const methodMetaData = getMethodMetaData(resolver, propertyKey.toString());

  methodMetaData.clazz = resolver.constructor;
  resolverMeta.resolverMap[typeName][fieldName] = methodMetaData;

  return descriptor;
};
