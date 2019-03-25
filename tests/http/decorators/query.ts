import 'reflect-metadata';
import { Query } from '../../../src/http';
import { getMethodMetaData } from '../../../src/http/factories/createHttpMethodDecorator';

describe('@Query', () => {
  it('attach proper injector to method param', () => {
    class Test {
      test(@Query('foo') foo: string) {}
    }

    const f = new Test();

    expect(getMethodMetaData('test', f)).toMatchSnapshot();
    const context: any = {};
    const metaData = {};
    expect(
      getMethodMetaData('test', f).paramaters[0].injector(
        { queryStringParameters: { foo: 'bar' } } as any,
        metaData,
        context
      )
    ).toBe('bar');
    expect(
      getMethodMetaData('test', f).paramaters[0].injector(
        {} as any,
        metaData,
        context
      )
    ).toBeFalsy();
  });
});
