import { APIGatewayProxyResult } from 'aws-lambda';
import { MetaData } from './MetaData';
import { ApolloError } from 'apollo-server-core';
import { ContainedType } from '../../container';

export type ExceptionFilterResponse = APIGatewayProxyResult | ApolloError;

export interface ExceptionFilter<Context = {}> {
  catch(
    exception: any,
    executionContext: Context,
    metaData: MetaData
  ): Promise<ExceptionFilterResponse> | ExceptionFilterResponse;
}

export type DecoratedExceptionFilter = {
  exceptions: Array<any>;
  filter: ContainedType<ExceptionFilter>;
};
