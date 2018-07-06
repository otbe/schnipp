import { APIGatewayProxyResult } from 'aws-lambda';

export function createResponse(
  statusCode: number,
  body?: Object,
  headers?: { [key: string]: string }
): APIGatewayProxyResult;
export function createResponse(
  statusCode: number,
  body?: string,
  headers?: { [key: string]: string }
): APIGatewayProxyResult;
export function createResponse(
  statusCode: number,
  body: any = {},
  headers: { [key: string]: string } = {}
): APIGatewayProxyResult {
  return {
    statusCode,
    body: typeof body !== 'string' ? JSON.stringify(body) : body,
    headers,
    isBase64Encoded: typeof body === 'string'
  };
}
