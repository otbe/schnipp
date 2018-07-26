import 'reflect-metadata';
import { Module, Bind, Container } from 'simple-ts-di';
import { RolesGuard } from './guards/RolesGuard';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { createMapper } from './providers/createMapper';
import { createHandler } from '../../dist';
import { EventResolver } from './graphql/EventResolver';
import { ItemNotFoundExceptionFilter } from './rest/ItemNotFoundExceptionFilter';
import { RestAuthorizer } from './rest/RestAuthorizer';
import { GraphqlAuthorizer } from './graphql/GraphqlAuthorizer';
import { GraphqlController } from './graphql/GraphqlController';
import { EventsController } from './rest/EventsController';
import { ItemNotFoundExceptionFilter2 } from './graphql/ItemNotFoundExceptionFilter2';

class MyModule implements Module {
  init(bind: Bind) {
    bind(GraphqlController);
    bind(EventsController);
    bind(EventResolver);
    bind(ItemNotFoundExceptionFilter);
    bind(ItemNotFoundExceptionFilter2);
    bind(RolesGuard);
    bind(RestAuthorizer);
    bind(GraphqlAuthorizer);
    bind(DataMapper).toFactory(createMapper);
  }
}

const c = new Container(new MyModule());

export const handle = createHandler(c, EventsController);

export const authorize = createHandler(c, RestAuthorizer);

export const authorize2 = createHandler(c, GraphqlAuthorizer);

export const handle2 = createHandler(c, GraphqlController);
