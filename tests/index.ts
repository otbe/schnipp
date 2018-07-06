import 'reflect-metadata';
import { createHandler } from '../src';
import { SNSEvent } from 'aws-lambda';
import { Module, Bind, Container } from 'simple-ts-di';
import { SNSHandler } from '../src/sns';

describe('schnipp', () => {
  it('should create a proper handler', async () => {
    const spy = jest.fn();
    class Test implements SNSHandler {
      async handle(e: SNSEvent) {
        spy();
      }
    }

    class MyModule implements Module {
      init(bind: Bind) {
        bind(Test);
      }
    }

    const c = new Container(new MyModule());
    const handler = createHandler(c, Test);

    await handler({} as any, {} as any, () => {});

    expect(spy).toHaveBeenCalled();
  });
});
