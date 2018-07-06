import { ScheduledEvent } from 'aws-lambda';
import { IHandler } from '../';

export type ScheduleHandler = IHandler<ScheduledEvent, void>;
