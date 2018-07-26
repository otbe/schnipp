import 'reflect-metadata';
import { Body } from '../../../../src/http/rest';
import { getMethodMetaData } from '../../../../src/http/rest/factories/createHttpMethodDecorator';

describe('@Body', () => {
  it('attach proper injector to method', () => {
    class Test {
      test(@Body() foo: string) {}
    }

    const f = new Test();

    expect(getMethodMetaData('test', f)).toMatchSnapshot();
    const context: any = {};
    const metaData = {};
    expect(
      getMethodMetaData('test', f).paramaters[0].injector(
        { body: '{"hello":"world"}' } as any,
        metaData,
        context
      )
    ).toEqual({ hello: 'world' });
    expect(
      getMethodMetaData('test', f).paramaters[0].injector(
        {} as any,
        metaData,
        context
      )
    ).toEqual({});
    expect(() =>
      getMethodMetaData('test', f).paramaters[0].injector(
        { body: 'a' } as any,
        metaData,
        context
      )
    ).toThrow();
  });
});
