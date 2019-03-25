import { createMethodParameterDecorator } from '../factories/createMethodParamDecorator';

export const Context = () =>
  createMethodParameterDecorator((e, m, context) => context);
