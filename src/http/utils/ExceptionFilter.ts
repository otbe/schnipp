import { APIGatewayProxyResult } from 'aws-lambda';
import { MetaData } from './MetaData';
import { DefaultExecutionContext } from './ExecutionContext';
import { ApolloError } from 'apollo-server-core';
import { ContainedType } from '../../container';

export type ExceptionFilterResponse = APIGatewayProxyResult | ApolloError;

export interface ExceptionFilter {
  catch<Context = DefaultExecutionContext>(
    exception: any,
    executionContext: Context,
    metaData: MetaData
  ): Promise<ExceptionFilterResponse> | ExceptionFilterResponse;
}

export type DecoratedExceptionFilter = {
  exceptions: Array<any>;
  filter: ContainedType<ExceptionFilter>;
};
