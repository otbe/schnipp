import { SQSEvent } from 'aws-lambda';
import { IHandler } from '../';

export type SQSHandler = IHandler<SQSEvent, void>;
