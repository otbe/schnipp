import {
  Schema,
  Resolver,
  Query,
  ResolveField,
  Use
} from '../../../dist/http/graphql';
import { join } from 'path';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { Event } from '../models/Event';
import { RolesGuard } from '../guards/RolesGuard';
import { GraphqlController } from './GraphqlController';
import { ItemNotFoundExceptionFilter } from '../rest/ItemNotFoundExceptionFilter';
import { ItemNotFoundExceptionFilter2 } from './ItemNotFoundExceptionFilter';
import { RolesAllowed } from './RolesAllowed';

@Resolver(GraphqlController)
@Schema(join(__dirname, './graphql/events.gql'))
export class EventResolver {
  constructor(private readonly mapper: DataMapper) {}

  @Query('events')
  async events(obj, args, context, info) {
    return this.toArray<Event>(await this.mapper.scan(Event));
  }

  @Query('event')
  @RolesAllowed('admin')
  @Use(ItemNotFoundExceptionFilter2)
  async event(_, args, context) {
    return await this.mapper.get(Event.of(args.id));
  }

  @ResolveField('Event', 'id')
  async id(event: Event, args, context, info) {
    return event.id + 1;
  }

  @ResolveField('Event', 'name')
  @Use(RolesGuard)
  @RolesAllowed('admin')
  name(event: Event, args, context, info) {
    return event.name;
  }

  private async toArray<T>(asyncIterable: AsyncIterableIterator<T>) {
    const result: Array<T> = [];
    for await (const u of asyncIterable) {
      result.push(u);
    }
    return result;
  }
}
