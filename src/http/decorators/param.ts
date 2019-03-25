import { createMethodParameterDecorator } from '../factories/createMethodParamDecorator';

export const Param = (name: string) =>
  createMethodParameterDecorator(e => (e.pathParameters || {})[name]);
