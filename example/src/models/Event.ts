import {
  table,
  hashKey,
  attribute
} from '@aws/dynamodb-data-mapper-annotations';

@table(process.env.EVENTS_INGRESS_QUEUE_TABLE!)
export class Event {
  @hashKey() id: string;
  @attribute() name: string;

  static of(id: string) {
    const e = new Event();
    e.id = id;
    return e;
  }
}
