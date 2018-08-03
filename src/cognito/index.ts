import { CognitoUserPoolTriggerEvent } from 'aws-lambda';
import { IHandler } from '../';

export type CognitoUserPoolHandler = IHandler<
  CognitoUserPoolTriggerEvent,
  CognitoUserPoolTriggerEvent
>;
