import 'reflect-metadata';
import { Param } from '../../../src/http';
import { getMethodMetaData } from '../../../src/http/factories/createHttpMethodDecorator';

describe('@Param', () => {
  it('attach proper injector to method', () => {
    class Test {
      test(@Param('foo') foo: string) {}
    }

    const f = new Test();

    expect(getMethodMetaData('test', f)).toMatchSnapshot();
    const context: any = {};
    const metaData = {};
    expect(
      getMethodMetaData('test', f).paramaters[0].injector(
        { pathParameters: { foo: 'bar' } } as any,
        metaData,
        context
      )
    ).toBe('bar');
    expect(
      getMethodMetaData('test', f).paramaters[0].injector(
        { pathParameters: {} } as any,
        metaData,
        context
      )
    ).toBeFalsy();
    expect(
      getMethodMetaData('test', f).paramaters[0].injector(
        {} as any,
        metaData,
        context
      )
    ).toBeFalsy();
  });
});
