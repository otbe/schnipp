import 'reflect-metadata';
import { Use, createResponse, Guard, ExceptionFilter } from '../../../src/http';
import { getMethodMetaData } from '../../../src/http/factories/createHttpMethodDecorator';
import { getControllerMetaData } from '../../../src/http/factories/createClassDectorator';

describe('@Use', () => {
  it('should add header metadata for methods and classes', () => {
    class TestGuard implements Guard {
      canActivate() {
        return true;
      }
    }

    class Filter implements ExceptionFilter {
      catch() {
        return createResponse(200);
      }
    }

    @Use(TestGuard, Filter)
    class Test {
      @Use(TestGuard, Filter)
      test() {}
    }

    const f = new Test();

    expect(getMethodMetaData('test', f)).toMatchSnapshot();
    expect(getControllerMetaData(Test)).toMatchSnapshot();
  });

  it('should throw on wrong usage', () => {
    expect(() => Use()()).toThrow();
    expect(() => Use()(1, 2, 3, 4)).toThrow();
  });
});
