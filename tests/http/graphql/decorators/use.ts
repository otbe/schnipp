import 'reflect-metadata';
import { createResponse, ExceptionFilter, Guard } from '../../../../src/http';
import { getControllerMetaData } from '../../../../src/http/decorators/getControllerMetaData';
import { GraphQLController, Query, Use } from '../../../../src/http/graphql';
import { getMethodMetaData } from '../../../../src/http/graphql/decorators/method';

describe('@Use', () => {
  it('should add guards and filters for methods and instances of GraphQLController', () => {
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

    class TestResolver {
      @Query('foo')
      @Use(TestGuard, Filter)
      foo() {}
    }

    @Use(TestGuard, Filter)
    class Test extends GraphQLController {
      getResolvers() {
        return [TestResolver];
      }
    }

    expect(getControllerMetaData(Test)).toMatchSnapshot();
    expect(getMethodMetaData(new TestResolver(), 'foo')).toMatchSnapshot();
  });

  it('should throw on wrong usage', () => {
    expect(() => Use()()).toThrow();
    expect(() => Use()(1, 2, 3, 4)).toThrow();
  });
});
