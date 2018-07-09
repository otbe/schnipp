import { KinesisStreamEvent } from 'aws-lambda';
import { IHandler } from '..';

export type KinesisStreamHandler = IHandler<KinesisStreamEvent>;
