import 'reflect-metadata';
import { Meta } from '../../../src/http';
import { getMethodMetaData } from '../../../src/http/factories/createHttpMethodDecorator';
import { getControllerMetaData } from '../../../src/http/factories/createClassDectorator';

describe('@Meta', () => {
  it('should add metadata for methods and classes', () => {
    @Meta('foo', 'bar')
    class Test {
      @Meta('bar', 'baz')
      test() {}
    }

    const f = new Test();

    expect(getMethodMetaData('test', f)).toMatchSnapshot();
    expect(getControllerMetaData(Test)).toMatchSnapshot();
  });

  it('should throw on wrong usage', () => {
    expect(() => Meta('bar', 'bar')()).toThrow();
    expect(() => Meta('bar', 'bar')(1, 2, 3, 4)).toThrow();
  });
});
