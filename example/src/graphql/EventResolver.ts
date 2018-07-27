import { DataMapper } from '@aws/dynamodb-data-mapper';
import {
  Query,
  ResolveField,
  Resolver,
  Schema,
  Use,
  Meta
} from '../../../dist/http/graphql';
import { Event } from '../models/Event';
import { GraphqlController } from './GraphqlController';
import { ItemNotFoundExceptionFilter2 } from './ItemNotFoundExceptionFilter2';
import { RolesAllowed } from './RolesAllowed';
import events from './gql/events.gql';

@Resolver(GraphqlController)
@Schema(events)
export class EventResolver {
  constructor(private readonly mapper: DataMapper) {}

  @Query('events')
  async events(obj, args, context, info) {
    return this.toArray<Event>(await this.mapper.scan(Event));
  }

  @Query('event')
  @RolesAllowed('admin')
  @Meta('foo', 'bar')
  @Use(ItemNotFoundExceptionFilter2)
  async event(_, args, context, info) {
    return await this.mapper.get(Event.of(args.id));
  }

  @ResolveField('Event', 'id')
  async id(event: Event, args, context, info) {
    return event.id + 1;
  }

  @ResolveField('Event', 'name')
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
