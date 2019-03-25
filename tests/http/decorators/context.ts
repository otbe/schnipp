import 'reflect-metadata';
import { Context } from '../../../src/http';
import { getMethodMetaData } from '../../../src/http/factories/createHttpMethodDecorator';

describe('@Context', () => {
  it('attach proper injector to method param', () => {
    class Test {
      test(@Context() c: any) {}
    }

    const f = new Test();

    expect(getMethodMetaData('test', f)).toMatchSnapshot();
    const context: any = { foo: 'bar' };
    const metaData = {};
    expect(
      getMethodMetaData('test', f).paramaters[0].injector(
        {} as any,
        metaData,
        context
      )
    ).toEqual({ foo: 'bar' });
  });
});
