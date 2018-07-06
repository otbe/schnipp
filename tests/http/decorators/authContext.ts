import 'reflect-metadata';
import { AuthContext } from '../../../src/http';
import { getMethodMetaData } from '../../../src/http/factories/createHttpMethodDecorator';

describe('@AuthContext', () => {
  it('attach proper injector to method param', () => {
    class Test {
      test(@AuthContext() c: any) {}
    }

    const f = new Test();

    expect(getMethodMetaData('test', f)).toMatchSnapshot();
    const context: any = {};
    const metaData = {};
    expect(
      getMethodMetaData('test', f).paramaters[0].injector(
        { requestContext: { authorizer: { foo: 'bar' } } } as any,
        metaData,
        context
      )
    ).toEqual({ foo: 'bar' });
    expect(
      getMethodMetaData('test', f).paramaters[0].injector(
        { requestContext: {} } as any,
        metaData,
        context
      )
    ).toEqual({});
  });
});
