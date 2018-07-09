import {
  CloudFrontRequestEvent,
  CloudFrontRequestResult,
  CloudFrontResponseEvent,
  CloudFrontResponseResult
} from 'aws-lambda';
import { IHandler } from '..';

export type CloudFrontRequestHandler = IHandler<
  CloudFrontRequestEvent,
  CloudFrontRequestResult
>;

export type CloudFrontResponseHandler = IHandler<
  CloudFrontResponseEvent,
  CloudFrontResponseResult
>;
