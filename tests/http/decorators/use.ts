import 'reflect-metadata';
import { Guard, ExceptionFilter, createResponse } from '../../../src/http';
import { RestController, Use } from '../../../src/http';
import { getMethodMetaData } from '../../../src/http/factories/createHttpMethodDecorator';
import { getControllerMetaData } from '../../../src/http/decorators/getControllerMetaData';

describe('@Use', () => {
  it('should add header metadata for methods and classes for RestControllers', () => {
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
    class Test extends RestController {
      @Use(TestGuard, Filter)
      test() {}
    }

    const f = new Test();

    expect(getMethodMetaData('test', f)).toMatchSnapshot();
    expect(getControllerMetaData(Test)).toMatchSnapshot();
  });

  // it('should add header metadata for methods and classes for GraphQLController', () => {
  //   class TestGuard implements Guard {
  //     canActivate() {
  //       return true;
  //     }
  //   }

  //   class Filter implements ExceptionFilter {
  //     catch() {
  //       return createResponse(200);
  //     }
  //   }

  //   @Use(TestGuard, Filter)
  //   class Test extends GraphQLController {}

  //   const f = new Test();

  //   @Resolver(Test)
  //   class TestResolver {
  //     @Use(TestGuard, Filter)
  //     @Query('foo')
  //     foo() {}
  //   }

  //   expect(getControllerMetaData(Test)).toMatchSnapshot();
  // });

  it('should throw on wrong usage', () => {
    expect(() => Use()()).toThrow();
    expect(() => Use()(1, 2, 3, 4)).toThrow();
  });
});
