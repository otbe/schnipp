import { createMethodDecorator } from './method';

export const ResolveField = (
  typeName: string,
  fieldName: string
): MethodDecorator => createMethodDecorator(typeName)(fieldName);
