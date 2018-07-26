import { APIGatewayEventRequestContext } from 'aws-lambda';

export type DefaultExecutionContext = Pick<
  APIGatewayEventRequestContext,
  'authorizer'
>;
