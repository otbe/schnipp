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

export { AuthPolicy, HttpVerb, Effect } from './utils/AuthPolicy';
export { createResponse } from './utils/createResponse';
export { MetaData } from './utils/MetaData';
export {
  DecoratedExceptionFilter,
  ExceptionFilter
} from './utils/ExceptionFilter';
export { Guard } from './utils/Guard';
export { Catch } from './decorators/catch';
export { RestController } from './RestController';

export {
  InjectedParam,
  MethodMetaData,
  ParamInjector
} from './factories/createHttpMethodDecorator';

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
export { StatusCode } from './decorators/statusCode';
export { Context } from './decorators/context';
export { Body } from './decorators/body';
export { Header } from './decorators/header';
export { Meta } from './decorators/meta';
export { Use } from './decorators/use';

export { HttpException } from './exceptions/HttpException';
export { NotFoundException } from './exceptions/NotFoundException';
export { ForbiddenException } from './exceptions/ForbiddenException';
