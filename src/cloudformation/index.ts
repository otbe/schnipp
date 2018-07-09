import {
  CloudFormationCustomResourceEvent,
  CloudFormationCustomResourceResponse
} from 'aws-lambda';
import { IHandler } from '../';

export type CloudFormationCustomResourceHandler = IHandler<
  CloudFormationCustomResourceEvent,
  CloudFormationCustomResourceResponse
>;
