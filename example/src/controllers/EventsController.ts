import { inject } from 'simple-ts-di';
import {
  RestController,
  POST,
  Body,
  GET,
  Header,
  Use,
  AuthContext,
  Param,
  Path,
  Meta
} from '../../../dist/http';
import { DataMapper } from '@aws/dynamodb-data-mapper';
import { AuthResponseContext } from 'aws-lambda';
import { RolesGuard } from '../guards/RolesGuard';
import { ItemNotFoundExceptionFilter } from '../filters/ItemNotFoundExceptionFilter';
import { Event } from '../models/Event';
import { v4 as uuid } from 'uuid';
import { RolesAllowed } from '../decorators/RolesAllowed';

@Path('/events')
@Use(RolesGuard)
@Meta('foo', 'bar')
@Header('baz', 'bar')
export class EventsController extends RestController {
  constructor(private readonly mapper: DataMapper) {
    super();
  }

  @POST()
  async create(@Body() e: any) {
    console.log(e);
    const event = new Event();
    event.id = uuid();
    event.name = 'Hello World';
    return await this.mapper.put(event);
  }

  @GET()
  @Header('foo', 'bar')
  async list(@AuthContext() c: AuthResponseContext) {
    return this.toArray<Event>(await this.mapper.scan(Event));
  }

  @GET('{id}')
  @RolesAllowed('admin')
  @Use(ItemNotFoundExceptionFilter)
  async get(@Param('id') id: string) {
    return await this.mapper.get(Event.of(id));
  }

  private async toArray<T>(asyncIterable: AsyncIterableIterator<T>) {
    const result: Array<T> = [];
    for await (const u of asyncIterable) {
      result.push(u);
    }
    return result;
  }
}
