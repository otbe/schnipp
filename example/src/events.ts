import 'reflect-metadata';
import { Module, Bind, Container } from 'simple-ts-di';
import { EventsController } from './controllers/EventsController';
import { ItemNotFoundExceptionFilter } from './filters/ItemNotFoundExceptionFilter';
import { RolesGuard } from './guards/RolesGuard';
import { EventAuthorizer } from './authorizers/EventAuthorizer';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { createMapper } from './providers/createMapper';
import { createHandler } from '../../dist';

class MyModule implements Module {
  init(bind: Bind) {
    bind(EventsController);
    bind(ItemNotFoundExceptionFilter);
    bind(RolesGuard);
    bind(EventAuthorizer);
    bind(DataMapper).toFactory(createMapper);
  }
}

const c = new Container(new MyModule());

export const handle = createHandler(c, EventsController);

export const authorize = createHandler(c, EventAuthorizer);
