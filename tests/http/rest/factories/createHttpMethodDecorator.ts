import 'reflect-metadata';
import {
  getMethodMetaData,
  findMethod
} from '../../../../src/http/rest/factories/createHttpMethodDecorator';
import { Path, GET, POST } from '../../../../src/http/rest';
import { ALL } from '../../../../src/http/rest/decorators/methods';

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
