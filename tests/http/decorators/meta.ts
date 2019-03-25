import 'reflect-metadata';
import { Meta, RestController } from '../../../src/http';
import { getMethodMetaData } from '../../../src/http/factories/createHttpMethodDecorator';
import { getControllerMetaData } from '../../../src/http/decorators/getControllerMetaData';

describe('@Meta', () => {
  it('should add metadata for methods and classes for RestControllers', () => {
    @Meta('foo', 'bar')
    class Test extends RestController {
      @Meta('bar', 'baz')
      test() {}
    }

    const f = new Test();

    expect(getMethodMetaData('test', f)).toMatchSnapshot();
    expect(getControllerMetaData(Test)).toMatchSnapshot();
  });

  // it('should add metadata for classes on GraphQLControllers', () => {
  //   @Meta('foo', 'bar')
  //   class Test extends GraphQLController {
  //     @Meta('bar', 'baz')
  //     test() {}
  //   }

  //   const f = new Test();

  //   // expect(getMethodMetaData('test', f)).toMatchSnapshot();
  //   expect(getControllerMetaData(Test)).toMatchSnapshot();
  // });

  it('should throw on wrong usage', () => {
    expect(() => Meta('bar', 'bar')()).toThrow();
    expect(() => Meta('bar', 'bar')(1, 2, 3, 4)).toThrow();
  });
});
