import 'reflect-metadata';
import {
  GraphQLController,
  Resolver,
  Query,
  ResolveField,
  Schema,
  Use,
  Header,
  Meta
} from '../../../src/http/graphql';
import { inject, Module, Bind, Container } from 'simple-ts-di';
import { HttpVerb, Guard, ExceptionFilter, Catch } from '../../../src/http';
import { HttpException } from '../../../src/http/rest';
import { ApolloError, gql } from 'apollo-server-core';

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

  class Service {}

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

  @inject()
  @Header('Access-Control-Allow-Origin', '*')
  @Meta('foo', 'bar')
  @Use(TestGuard, TestFilter)
  class Test extends GraphQLController {
    async createExecutionContext() {
      return executionContext;
    }
  }

  @Resolver(Test)
  @Schema(schema)
  class TestResolver {
    @Query('foos')
    foo(_, args, context) {
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

  class MyModule implements Module {
    init(bind: Bind) {
      bind(Service);
      bind(Test);
      bind(TestResolver);
      bind(TestGuard);
      bind(TestGuard2);
      bind(TestFilter);
      bind(TestFilter2);
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
    const c = new Container(new MyModule());
    const h = await c.get(Test);
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
    const c = new Container(new MyModule());
    const h = await c.get(Test);
    const res = await h.handle(routeFor(query()), context);

    expect(queryHandle).not.toHaveBeenCalled();
    expect(fieldHandle).not.toHaveBeenCalled();
    expect(fieldHandle2).not.toHaveBeenCalled();
    expect(res).toMatchSnapshot();
  });

  it('should return forbidden (null value) for specific field ', async () => {
    guardHandle2.mockResolvedValue(false);
    const c = new Container(new MyModule());
    const h = await c.get(Test);
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
    const c = new Container(new MyModule());
    const h = await c.get(Test);
    const res = await h.handle(routeFor(query()), context);

    expect(fieldHandle).not.toHaveBeenCalled();
    expect(fieldHandle2).not.toHaveBeenCalled();
    expect(res).toMatchSnapshot();
  });

  it('should map arbritary errors to graphql errors', async () => {
    queryHandle.mockRejectedValueOnce(new Error('foo'));
    const c = new Container(new MyModule());
    const h = await c.get(Test);
    const res = await h.handle(routeFor(query()), context);

    expect(fieldHandle).not.toHaveBeenCalled();
    expect(fieldHandle2).not.toHaveBeenCalled();
    expect(res).toMatchSnapshot();
  });

  it('should filter errors from controller on root types', async () => {
    filterHandle.mockResolvedValue(new ApolloError('bar', 'BAR'));
    queryHandle.mockRejectedValue(new HttpException(400));
    const c = new Container(new MyModule());
    const h = await c.get(Test);
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
    const c = new Container(new MyModule());
    const h = await c.get(Test);
    const res = await h.handle(routeFor(query()), context);

    expect(queryHandle).toHaveBeenCalled();
    expect(fieldHandle).toHaveBeenCalled();
    expect(fieldHandle2).toHaveBeenCalled();
    expect(res).toMatchSnapshot();
  });

  it('should filter errors from method', async () => {
    filterHandle2.mockResolvedValue(new ApolloError('bar'));
    fieldHandle2.mockRejectedValue(new HttpException(400));
    const c = new Container(new MyModule());
    const h = await c.get(Test);
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