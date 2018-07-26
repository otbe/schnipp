import 'reflect-metadata';
import { StatusCode, GET, POST } from '../../../../src/http/rest';
import { getMethodMetaData } from '../../../../src/http/rest/factories/createHttpMethodDecorator';

describe('@StatusCode', () => {
  it('should add statusCode ', () => {
    class Test {
      @StatusCode(245)
      test() {}
    }

    const f = new Test();

    expect(getMethodMetaData('test', f)).toMatchSnapshot();
  });

  it('should coop with methods ', () => {
    class Test {
      @GET('/')
      @StatusCode(245)
      test() {}

      @POST('/bar')
      @StatusCode(202)
      test2() {}
    }

    const f = new Test();
    expect(getMethodMetaData('test', f)).toMatchSnapshot();
    expect(getMethodMetaData('test2', f)).toMatchSnapshot();
  });
});
