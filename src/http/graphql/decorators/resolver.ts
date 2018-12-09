import { ResolverMeta } from './method';

const RESOLVER = Symbol('graphql-resolver');

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
