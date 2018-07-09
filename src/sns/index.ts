import { SNSEvent } from 'aws-lambda';
import { IHandler } from '../';

export type SNSHandler = IHandler<SNSEvent>;
