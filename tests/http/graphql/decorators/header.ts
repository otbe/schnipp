import 'reflect-metadata';
import { Header, GraphQLController } from '../../../../src/http/graphql';
import { getControllerMetaData } from '../../../../src/http/decorators/getControllerMetaData';

describe('@Header', () => {
  it('should add header metadata for classes for GraphQLControllers', () => {
    @Header('foo', 'bar')
    class Test extends GraphQLController {
      test() {}

      getResolvers() {
        return [];
      }
    }

    expect(getControllerMetaData(Test)).toMatchSnapshot();
  });
});
