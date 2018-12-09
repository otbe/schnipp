import { DataMapper } from '@aws/dynamodb-data-mapper';
import { Service } from 'typedi';
import { Meta, Query, ResolveField, Use } from '../../../dist/http/graphql';
import { Event } from '../models/Event';
import { ItemNotFoundExceptionFilter2 } from './ItemNotFoundExceptionFilter2';
import { RolesAllowed } from './RolesAllowed';

@Service()
export class EventResolver {
  constructor(private readonly mapper: DataMapper) {}

  @Query()
  async events(obj, args, context, info) {
    return this.toArray<Event>(await this.mapper.scan(Event));
  }

  @Query()
  @Meta('foo', 'bar')
  @Use(ItemNotFoundExceptionFilter2)
  async event(_, args, context, info) {
    return await this.mapper.get(Event.of(args.id));
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
