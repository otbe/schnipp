import { DynamoDBStreamEvent } from 'aws-lambda';
import { IHandler } from '../';

export type DynamoDBStreamHandler = IHandler<DynamoDBStreamEvent, void>;
