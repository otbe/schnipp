import { APIGatewayProxyResult } from 'aws-lambda';
import { MetaData } from './MetaData';
import { Newable } from 'simple-ts-di';
import { DefaultExecutionContext } from './ExecutionContext';
import { GraphQLError } from 'graphql';

export type ExceptionFilterResponse = APIGatewayProxyResult | GraphQLError;

export interface ExceptionFilter {
  catch<Context = DefaultExecutionContext>(
    exception: any,
    executionContext: Context,
    metaData: MetaData
  ): Promise<ExceptionFilterResponse> | ExceptionFilterResponse;
}

export type DecoratedExceptionFilter = {
  exceptions: Array<any>;
  filter: Newable<ExceptionFilter>;
};
