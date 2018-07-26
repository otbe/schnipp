import { getResolverMetaData } from './resolver';

export const Schema = (...path: Array<string>): ClassDecorator => (
  resolver: any
) => {
  const resolverMeta = getResolverMetaData(resolver);

  resolverMeta.schemaPath = path;
};
