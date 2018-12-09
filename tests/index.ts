import 'reflect-metadata';
import { createHandler } from '../src';
import { SNSEvent } from 'aws-lambda';
import { SNSHandler } from '../src/sns';

describe('schnipp', () => {
  it('should create a proper handler', async () => {
    const spy = jest.fn();
    class Test implements SNSHandler {
      async handle(e: SNSEvent) {
        spy();
      }
    }

    const handler = createHandler(Test);

    await handler({} as any, {} as any, () => {});

    expect(spy).toHaveBeenCalled();
  });
});
