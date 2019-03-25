import { APIGatewayProxyResult } from 'aws-lambda';
import { MetaData } from './MetaData';
import { ContainedType } from '../../container';

export type ExceptionFilterResponse = APIGatewayProxyResult;

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
