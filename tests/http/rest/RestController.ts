import 'reflect-metadata';
import {
  RestController,
  Path,
  GET,
  POST,
  StatusCode,
  Param,
  Query,
  HttpException,
  Header,
  Meta,
  Use
} from '../../../src/http/rest';
import {
  HttpVerb,
  createResponse,
  APIGatewayHandler,
  Guard,
  ExceptionFilter,
  Catch
} from '../../../src/http';
import { createHandler } from '../../../src';
import { ContainedType } from '../../../src/container';

describe('RestController', () => {
  const context: any = {};
  const handle = jest.fn();
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

  @Path('/events')
  @Header('bar', 'foo')
  @Meta('roles', 'foo')
  @Use(TestGuard, TestFilter)
  class Test extends RestController {
    @GET()
    async simpleGet() {
      return handle();
    }

    @POST()
    async simplePost() {
      return handle();
    }

    @POST('/foo')
    @StatusCode(204)
    async simplePost2() {
      return handle();
    }

    @GET('/foo2')
    @Header('bar', 'baz')
    async get2() {
      return handle();
    }

    @GET('/foo3/{id}')
    async get3(@Param('id') id: string, @Query('search') search: string) {
      return handle(id, search);
    }

    @GET('/error')
    async get4() {
      throw new HttpException(429);
    }

    @GET('/error2')
    @Use(TestFilter2)
    @Meta('roles', 'bar')
    async get5() {
      throw new HttpException(429);
    }

    @GET('/multiple-guards')
    @Use(TestGuard2)
    @Meta('roles', 'bar')
    async get6() {
      return handle();
    }

    async createExecutionContext() {
      return 5;
    }
  }

  beforeEach(() => {
    handle.mockReset();
    filterHandle.mockReset();
    filterHandle2.mockReset();
    guardHandle.mockReset();
    guardHandle2.mockReset();
    guardHandle.mockResolvedValue(true);
    guardHandle2.mockResolvedValue(true);
  });

  it('simple get', async () => {
    const handler = setup(Test);
    handle.mockResolvedValue({ foo: 'bar' });

    const res = await handler(
      routeFor('/events', HttpVerb.GET),
      context,
      () => {}
    );

    expect(res).toMatchSnapshot();
  });

  it('simple post', async () => {
    const handler = setup(Test);
    handle.mockResolvedValue({ foo: 'bar2' });

    const res = await handler(
      routeFor('/events', HttpVerb.POST),
      context,
      () => {}
    );

    expect(res).toMatchSnapshot();
  });

  it('no method found', async () => {
    const handler = setup(Test);

    const res = await handler(
      routeFor('/not-found', HttpVerb.GET),
      context,
      () => {}
    );

    expect(res).toMatchSnapshot();
  });

  it('failed get', async () => {
    const handler = setup(Test);
    handle.mockRejectedValue(new HttpException(404));
    filterHandle.mockResolvedValue(null);

    const res = await handler(
      routeFor('/events', HttpVerb.GET),
      context,
      () => {}
    );

    expect(res).toMatchSnapshot();
  });

  it('with custom path/status code', async () => {
    const handler = setup(Test);
    handle.mockResolvedValue({ foo: 'bar3' });

    const res = await handler(
      routeFor('/events/foo', HttpVerb.POST),
      context,
      () => {}
    );

    expect(res).toMatchSnapshot();
  });

  it('with custom header', async () => {
    const handler = setup(Test);
    handle.mockResolvedValue({ foo: 'bar4' });

    const res = await handler(
      routeFor('/events/foo2', HttpVerb.GET),
      context,
      () => {}
    );

    expect(res).toMatchSnapshot();
  });

  it('with path/query param', async () => {
    const handler = setup(Test);
    handle.mockResolvedValue({});

    const res = await handler(
      routeFor(
        '/events/foo3/{id}',
        HttpVerb.GET,
        { id: 'id' },
        { search: 'all' }
      ),
      context,
      () => {}
    );

    expect(res).toMatchSnapshot();
    expect(handle).toHaveBeenCalledWith('id', 'all');
  });

  it('filter', async () => {
    const handler = setup(Test);
    handle.mockResolvedValue({});
    filterHandle.mockResolvedValue(
      createResponse(430, { message: 'filtered error' })
    );

    const event = routeFor('/events/error', HttpVerb.GET);
    const res = await handler(event, context, () => {});

    expect(res).toMatchSnapshot();
    expect(filterHandle).toHaveBeenCalledWith(expect.any(HttpException), 5, {
      roles: 'foo'
    });
  });

  it('failed filter', async () => {
    const handler = setup(Test);
    handle.mockResolvedValue({});
    filterHandle.mockRejectedValue({});

    const event = routeFor('/events/error', HttpVerb.GET);
    const res = await handler(event, context, () => {});

    expect(res).toMatchSnapshot();
  });

  it('filter with custom meta and own Use', async () => {
    const handler = setup(Test);
    handle.mockResolvedValue({});
    filterHandle2.mockResolvedValue(
      createResponse(430, { message: 'filtered error' })
    );

    const event = routeFor('/events/error2', HttpVerb.GET);
    const res = await handler(event, context, () => {});

    expect(res).toMatchSnapshot();
    expect(filterHandle).not.toHaveBeenCalled();
    expect(filterHandle2).toHaveBeenCalledWith(expect.any(HttpException), 5, {
      roles: 'bar'
    });
  });

  it('no matching filter', async () => {
    const handler = setup(Test);
    handle.mockRejectedValue(new Error());
    filterHandle.mockResolvedValue(null);

    const event = routeFor('/events', HttpVerb.GET);
    const res = await handler(event, context, () => {});

    expect(res).toMatchSnapshot();
  });

  it('guard', async () => {
    const handler = setup(Test);
    handle.mockResolvedValue({});
    guardHandle.mockResolvedValue(false);

    const event = routeFor('/events', HttpVerb.GET);
    const res = await handler(event, context, () => {});

    expect(res).toMatchSnapshot();
    expect(guardHandle).toHaveBeenCalledWith(5, { roles: 'foo' });
  });

  it('failed guard', async () => {
    const handler = setup(Test);
    handle.mockResolvedValue({});
    guardHandle.mockRejectedValue(false);

    const event = routeFor('/events', HttpVerb.GET);
    const res = await handler(event, context, () => {});

    expect(res).toMatchSnapshot();
  });

  it('failed guard (with filter)', async () => {
    const handler = setup(Test);
    handle.mockResolvedValue({});
    guardHandle.mockRejectedValue(new HttpException(403));
    filterHandle.mockResolvedValue(
      createResponse(430, { message: 'filtered error' })
    );

    const event = routeFor('/events', HttpVerb.GET);
    const res = await handler(event, context, () => {});

    expect(res).toMatchSnapshot();
  });

  it('filter with custom meta and own Use', async () => {
    const handler = setup(Test);
    handle.mockResolvedValue({});
    guardHandle2.mockResolvedValue(false);
    guardHandle.mockResolvedValue(true);

    const event = routeFor('/events/multiple-guards', HttpVerb.GET);
    const res = await handler(event, context, () => {});

    expect(res).toMatchSnapshot();
    expect(guardHandle2).toHaveBeenCalledWith(5, { roles: 'bar' });
    expect(guardHandle).toHaveBeenCalledWith(5, { roles: 'bar' });
  });
});

export function setup(Test: ContainedType<APIGatewayHandler>) {
  return createHandler(Test);
}

function routeFor(
  resource: string,
  method: HttpVerb,
  pathParam = {},
  queryParam = {},
  requestContext = {}
): any {
  return {
    resource,
    httpMethod: method,
    pathParameters: pathParam,
    queryStringParameters: queryParam,
    requestContext
  };
}
