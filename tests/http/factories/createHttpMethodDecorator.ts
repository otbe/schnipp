import 'reflect-metadata';
import {
  getMethodMetaData,
  findMethod
} from '../../../src/http/factories/createHttpMethodDecorator';
import { Path, GET, POST } from '../../../src/http';
import { ALL } from '../../../src/http/decorators/methods';

describe('getMethodMetaData', () => {
  it('should return default meta data', () => {
    class Test {
      test() {}
    }

    const f = new Test();
    expect(getMethodMetaData('test', f)).toMatchSnapshot();
  });
});

describe('findMethod', () => {
  it('find method for request', () => {
    @Path('/events')
    class Test {
      @GET()
      get() {}

      @GET('/{id}')
      detail() {}

      @POST()
      post() {}

      @ALL()
      all() {}
    }

    const f = new Test();
    expect(findMethod('/events', '/events', 'GET', f)).toMatchSnapshot();
    expect(findMethod('/events', '/events/{id}', 'GET', f)).toMatchSnapshot();
    expect(findMethod('/events', '/events', 'POST', f)).toMatchSnapshot();
    expect(
      findMethod('/events', '/events/fooo', 'OPTIONS', f)
    ).toMatchSnapshot();
  });
});
