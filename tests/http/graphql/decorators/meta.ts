import 'reflect-metadata';
import { Meta, GraphQLController } from '../../../../src/http/graphql';
import { getControllerMetaData } from '../../../../src/http/decorators/getControllerMetaData';
import { getMethodMetaData } from '../../../../src/http/graphql/decorators/method';

describe('@Meta', () => {
  it('should add metadata for classes on GraphQLControllers', () => {
    @Meta('foo', 'bar')
    class Test extends GraphQLController {
      @Meta('bar', 'baz')
      test() {}

      getResolvers() {
        return [];
      }
    }
    const f = new Test();
    expect(getMethodMetaData(f, 'test')).toMatchSnapshot();
    expect(getControllerMetaData(Test)).toMatchSnapshot();
  });
});
