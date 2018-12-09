import { gql, ApolloError } from 'apollo-server-core';
import 'reflect-metadata';
import { getFromContainer } from '../../../src/container';
import { Catch, ExceptionFilter, Guard, HttpVerb } from '../../../src/http';
import {
  GraphQLController,
  Header,
  Meta,
  Query,
  ResolveField,
  Use
} from '../../../src/http/graphql';
import { HttpException } from '../../../src/http/rest';

const schema = gql`
  type Foo {
    id: ID!
    name: String
  }

  type Query {
    foos: [Foo]
  }
`;

describe('GraphQLController.ts', () => {
  const context: any = {};
  const executionContext = { foo: 5 };
  const queryHandle = jest.fn();
  const fieldHandle = jest.fn();
  const fieldHandle2 = jest.fn();
  const guardHandle = jest.fn();
  const guardHandle2 = jest.fn();
  const filterHandle = jest.fn();
  const filterHandle2 = jest.fn();

  class TestGuard implements Guard {
    canActivate(c, m) {
      return guardHandle(c, m);
    }
  }

  class TestGuard2 implements Guard {
    canActivate(c, m) {
      return guardHandle2(c, m);
    }
  }

  @Catch(HttpException)
  class TestFilter implements ExceptionFilter {
    catch(e, context, m) {
      return filterHandle(e, context, m);
    }
  }

  @Catch(HttpException)
  class TestFilter2 implements ExceptionFilter {
    catch(e, context, m) {
      return filterHandle2(e, context, m);
    }
  }

  class TestResolver {
    @Query()
    foos(_, args, context) {
      return queryHandle(context);
    }

    @ResolveField('Foo', 'id')
    async fooId(foo) {
      await fieldHandle(foo);
      return foo.id + 1;
    }

    @ResolveField('Foo', 'name')
    @Meta('bar', 'baz')
    @Use(TestGuard2, TestFilter2)
    async fooName(foo) {
      await fieldHandle2(foo);
      return 'Hello ' + foo.name;
    }
  }

  @Header('Access-Control-Allow-Origin', '*')
  @Meta('foo', 'bar')
  @Use(TestGuard, TestFilter)
  class Test extends GraphQLController {
    getApolloServerOptions() {
      return { typeDefs: schema };
    }

    async createExecutionContext() {
      return executionContext;
    }

    getResolvers() {
      return [TestResolver];
    }
  }

  beforeEach(() => {
    queryHandle.mockClear();
    queryHandle.mockResolvedValue([{ id: 1, name: 'foo' }]);
    fieldHandle.mockReset();
    fieldHandle2.mockReset();
    filterHandle.mockReset();
    filterHandle2.mockReset();
    guardHandle.mockReset();
    guardHandle2.mockReset();
    guardHandle.mockResolvedValue(true);
    guardHandle2.mockResolvedValue(true);
  });

  it('should handle basic usage patterns ', async () => {
    const h = getFromContainer(Test);

    const res = await h.handle(routeFor(query()), context);

    expect(guardHandle).toHaveBeenCalledWith(
      expect.objectContaining(executionContext),
      { foo: 'bar' }
    );
    expect(queryHandle).toHaveBeenCalledWith(
      expect.objectContaining(executionContext)
    );
    expect(fieldHandle).toHaveBeenCalled();
    expect(fieldHandle2).toHaveBeenCalled();
    expect(res).toMatchSnapshot();
  });

  it('should return forbidden error for entire API', async () => {
    guardHandle.mockResolvedValue(false);

    const h = getFromContainer(Test);
    const res = await h.handle(routeFor(query()), context);

    expect(queryHandle).not.toHaveBeenCalled();
    expect(fieldHandle).not.toHaveBeenCalled();
    expect(fieldHandle2).not.toHaveBeenCalled();
    expect(res).toMatchSnapshot();
  });

  it('should return forbidden (null value) for specific field ', async () => {
    guardHandle2.mockResolvedValue(false);
    const h = getFromContainer(Test);
    const res = await h.handle(routeFor(query()), context);

    expect(guardHandle2).toHaveBeenCalledWith(
      expect.objectContaining(executionContext),
      { bar: 'baz', foo: 'bar' }
    );
    expect(queryHandle).toHaveBeenCalled();
    expect(fieldHandle).toHaveBeenCalled();
    expect(fieldHandle2).not.toHaveBeenCalled();
    expect(res).toMatchSnapshot();
  });

  it('should pass custom graphql errors to the client ', async () => {
    queryHandle.mockRejectedValueOnce(new ApolloError('foo', 'FOO'));
    const h = getFromContainer(Test);
    const res = await h.handle(routeFor(query()), context);

    expect(fieldHandle).not.toHaveBeenCalled();
    expect(fieldHandle2).not.toHaveBeenCalled();
    expect(res).toMatchSnapshot();
  });

  it('should map arbritary errors to graphql errors', async () => {
    queryHandle.mockRejectedValueOnce(new Error('foo'));
    const h = getFromContainer(Test);
    const res = await h.handle(routeFor(query()), context);

    expect(fieldHandle).not.toHaveBeenCalled();
    expect(fieldHandle2).not.toHaveBeenCalled();
    expect(res).toMatchSnapshot();
  });

  it('should filter errors from controller on root types', async () => {
    filterHandle.mockResolvedValue(new ApolloError('bar', 'BAR'));
    queryHandle.mockRejectedValue(new HttpException(400));
    const h = getFromContainer(Test);
    const res = await h.handle(routeFor(query()), context);

    expect(filterHandle).toHaveBeenCalledWith(
      expect.any(HttpException),
      expect.objectContaining(executionContext),
      {
        foo: 'bar'
      }
    );
    expect(queryHandle).toHaveBeenCalled();
    expect(fieldHandle).not.toHaveBeenCalled();
    expect(fieldHandle2).not.toHaveBeenCalled();
    expect(res).toMatchSnapshot();
  });

  it('should filter errors from controller on abritrary types', async () => {
    filterHandle.mockResolvedValue(new ApolloError('bar'));
    fieldHandle.mockRejectedValue(new HttpException(400));
    const h = getFromContainer(Test);
    const res = await h.handle(routeFor(query()), context);

    expect(queryHandle).toHaveBeenCalled();
    expect(fieldHandle).toHaveBeenCalled();
    expect(fieldHandle2).toHaveBeenCalled();
    expect(res).toMatchSnapshot();
  });

  it('should filter errors from method', async () => {
    filterHandle2.mockResolvedValue(new ApolloError('bar'));
    fieldHandle2.mockRejectedValue(new HttpException(400));
    const h = getFromContainer(Test);
    const res = await h.handle(routeFor(query()), context);

    expect(filterHandle2).toHaveBeenCalledWith(
      expect.any(HttpException),
      expect.objectContaining(executionContext),
      {
        bar: 'baz',
        foo: 'bar'
      }
    );
    expect(queryHandle).toHaveBeenCalled();
    expect(fieldHandle).toHaveBeenCalled();
    expect(fieldHandle2).toHaveBeenCalled();
    expect(res).toMatchSnapshot();
  });
});

const query = () => JSON.stringify({ query: `{ foos { id name } }` });

function routeFor(body: string, requestContext = {}): any {
  return {
    body,
    httpMethod: HttpVerb.POST,
    requestContext
  };
}
