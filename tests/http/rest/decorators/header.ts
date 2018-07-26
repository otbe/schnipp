import 'reflect-metadata';
import { Header, RestController } from '../../../../src/http/rest';
import { getMethodMetaData } from '../../../../src/http/rest/factories/createHttpMethodDecorator';
import { getControllerMetaData } from '../../../../src/http/decorators/getControllerMetaData';

describe('@Header', () => {
  it('should add header metadata for methods and classes on RestControllers', () => {
    @Header('foo', 'bar')
    class Test extends RestController {
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
