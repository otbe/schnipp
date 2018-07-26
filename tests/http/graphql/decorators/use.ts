import 'reflect-metadata';
import { Guard, ExceptionFilter, createResponse } from '../../../../src/http';
import {
  Use,
  GraphQLController,
  Resolver,
  Query
} from '../../../../src/http/graphql';
import { getMethodMetaData } from '../../../../src/http/graphql/decorators/method';
import { getControllerMetaData } from '../../../../src/http/decorators/getControllerMetaData';

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

    @Use(TestGuard, Filter)
    class Test extends GraphQLController {}

    @Resolver(Test)
    class TestResolver {
      @Query('foo')
      @Use(TestGuard, Filter)
      foo() {}
    }
    expect(getControllerMetaData(Test)).toMatchSnapshot();
    expect(getMethodMetaData(new TestResolver(), 'foo')).toMatchSnapshot();
  });

  it('should throw on wrong usage', () => {
    expect(() => Use()()).toThrow();
    expect(() => Use()(1, 2, 3, 4)).toThrow();
  });
});
