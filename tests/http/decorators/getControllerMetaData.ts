import 'reflect-metadata';
import { getControllerMetaData } from '../../../src/http/decorators/getControllerMetaData';
import { RestController } from '../../../src/http/rest';
import { GraphQLController } from '../../../src/http/graphql';

describe('getControllerMetaData', () => {
  it('should return default meta data for Rest controllers', () => {
    class Test extends RestController {
      test() {}
    }

    expect(getControllerMetaData(Test)).toMatchSnapshot();
  });

  it('should return default meta data for GraphQL controllers', () => {
    class Test extends GraphQLController {
      test() {}
    }

    expect(getControllerMetaData(Test)).toMatchSnapshot();
  });
});
