import 'reflect-metadata';
import { createMethodParameterDecorator } from '../../../../src/http/rest/factories/createMethodParamDecorator';
import { getMethodMetaData } from '../../../../src/http/rest/factories/createHttpMethodDecorator';

describe('createMethodParamDecorator', () => {
  it('let me create a new decortor with an proper injector attached to the method', () => {
    const F = createMethodParameterDecorator(e => e.body);

    class Test {
      test(@F test: string, @F bar: any) {}
    }

    const f = new Test();
    expect(getMethodMetaData('test', f)).toMatchSnapshot();
    expect(getMethodMetaData('test', f).paramaters[1].index).toBe(0);
    expect(getMethodMetaData('test', f).paramaters[0].index).toBe(1);
    expect(
      getMethodMetaData('test', f).paramaters[0].injector(
        { body: 'bar' } as any,
        {},
        {} as any
      )
    ).toBe('bar');
  });
});
