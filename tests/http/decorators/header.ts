import 'reflect-metadata';
import { Header } from '../../../src/http';
import { getMethodMetaData } from '../../../src/http/factories/createHttpMethodDecorator';
import { getControllerMetaData } from '../../../src/http/factories/createClassDectorator';

describe('@Header', () => {
  it('should add header metadata for methods and classes', () => {
    @Header('foo', 'bar')
    class Test {
      @Header('bar', 'baz')
      test() {}
    }

    const f = new Test();

    expect(getMethodMetaData('test', f)).toMatchSnapshot();
    expect(getControllerMetaData(Test)).toMatchSnapshot();
  });

  it('should throw on wrong usage', () => {
    expect(() => Header('bar', 'bar')()).toThrow();
    expect(() => Header('bar', 'bar')(1, 2, 3, 4)).toThrow();
  });
});
