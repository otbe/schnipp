import { IHandler } from '..';
import { CodePipelineEvent } from 'aws-lambda';

export type CodePipelineHandler = IHandler<CodePipelineEvent>;
