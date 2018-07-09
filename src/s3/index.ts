import { S3Event } from 'aws-lambda';
import { IHandler } from '../';

export type S3Handler = IHandler<S3Event>;
