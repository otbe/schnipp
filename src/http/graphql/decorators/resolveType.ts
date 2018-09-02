import { ResolveField } from './resolveField';

export const ResolveType = (typeName: string) =>
  ResolveField(typeName, '__resolveType');
