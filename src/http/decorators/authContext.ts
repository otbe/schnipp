import { createMethodParameterDecorator } from '../factories/createMethodParamDecorator';

export const AuthContext = () =>
  createMethodParameterDecorator(e => e.requestContext.authorizer || {});
