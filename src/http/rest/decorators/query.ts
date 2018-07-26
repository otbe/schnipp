import { createMethodParameterDecorator } from '../factories/createMethodParamDecorator';

export const Query = (name: string) =>
  createMethodParameterDecorator(e => (e.queryStringParameters || {})[name]);
