import { createMethodParameterDecorator } from '../factories/createMethodParamDecorator';

export const Body = () =>
  createMethodParameterDecorator(e => JSON.parse(e.body || '{}'));
