import { CloudWatchLogsEvent } from 'aws-lambda';
import { IHandler } from '../';

export type CloudwatchHandler = IHandler<CloudWatchLogsEvent, void>;
