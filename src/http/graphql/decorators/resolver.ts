import { Newable, inject } from 'simple-ts-di';
import { GraphQLController } from '..';
import {
  getControllerMetaData,
  GraphQLControllerData
} from '../../decorators/getControllerMetaData';
import { ResolverMeta } from './method';

const RESOLVER = Symbol('graphql-resolver');

export const Resolver = <T extends GraphQLController>(
  controller: Newable<T>
): ClassDecorator => (resolver: any) => {
  inject()(resolver);
  const controllerMeta = getControllerMetaData(
    controller
  ) as GraphQLControllerData;
  const resolverMeta = getResolverMetaData(resolver);

  controllerMeta.resolver = controllerMeta.resolver || [];
  controllerMeta.resolver.push(resolverMeta);
};

export const getResolverMetaData = (resolver: any) => {
  let data: ResolverMeta | null = Reflect.getMetadata(RESOLVER, resolver);

  if (data == null) {
    data = {
      resolverMap: {}
    };
    Reflect.defineMetadata(RESOLVER, data, resolver);
  }

  return data;
};
