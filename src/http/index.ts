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
export { DefaultExecutionContext } from './utils/ExecutionContext';
export { Catch } from './decorators/catch';
