import 'reflect-metadata';
import { getControllerMetaData } from '../../../src/http/factories/createClassDectorator';

describe('getControllerMetaData', () => {
  it('should return default meta data', () => {
    class Test {
      test() {}
    }

    expect(getControllerMetaData(Test)).toMatchSnapshot();
  });
});
