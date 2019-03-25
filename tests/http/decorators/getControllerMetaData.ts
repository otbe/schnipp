import 'reflect-metadata';
import { getControllerMetaData } from '../../../src/http/decorators/getControllerMetaData';
import { RestController } from '../../../src/http';

describe('getControllerMetaData', () => {
  it('should return default meta data for Rest controllers', () => {
    class Test extends RestController {
      test() {}
    }

    expect(getControllerMetaData(Test)).toMatchSnapshot();
  });
});
