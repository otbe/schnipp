import { DataMapper } from '@aws/dynamodb-data-mapper';
import 'reflect-metadata';
import Container from 'typedi';
import { createHandler, useContainer } from '../../dist';
import { createMapper } from './providers/createMapper';
import { EventsController } from './rest/EventsController';
import { RestAuthorizer } from './rest/RestAuthorizer';

useContainer(Container);

Container.set(DataMapper, createMapper());

export const handle = createHandler(EventsController);

export const authorize = createHandler(RestAuthorizer);
