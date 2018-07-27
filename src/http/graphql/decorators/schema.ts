import { getResolverMetaData } from './resolver';
import { DocumentNode } from 'graphql';

export const Schema = (document: DocumentNode): ClassDecorator => (
  resolver: any
) => {
  const resolverMeta = getResolverMetaData(resolver);

  resolverMeta.document = document;
};
