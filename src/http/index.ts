import {
  APIGatewayEvent,
  APIGatewayProxyResult,
  CustomAuthorizerEvent,
  CustomAuthorizerResult
} from 'aws-lambda';
import { IHandler } from '..';

export type APIGatewayHandler = IHandler<
  APIGatewayEvent,
  APIGatewayProxyResult
>;

export type AuthorizeHandler = IHandler<
  CustomAuthorizerEvent,
  CustomAuthorizerResult
>;

export { RestController } from './RestController';

export {
  InjectedParam,
  MetaData,
  MethodMetaData,
  ParamInjector,
  DecoratedExceptionFilter,
  Guard,
  ExceptionFilter
} from './factories/createHttpMethodDecorator';

export { Catch } from './decorators/catch';
export {
  GET,
  POST,
  DELETE,
  PUT,
  PATCH,
  OPTIONS,
  HEAD
} from './decorators/methods';
export { Path } from './decorators/path';
export { Param } from './decorators/param';
export { Query } from './decorators/query';
export { Header } from './decorators/header';
export { StatusCode } from './decorators/statusCode';
export { AuthContext } from './decorators/authContext';
export { Meta } from './decorators/meta';
export { Body } from './decorators/body';
export { Use } from './decorators/use';

export { HttpException } from './exceptions/HttpException';
export { NotFoundException } from './exceptions/NotFoundException';
export { ForbiddenException } from './exceptions/ForbiddenException';

export { AuthPolicy, HttpVerb, Effect } from './utils/AuthPolicy';
export { createResponse } from './utils/createResponse';
