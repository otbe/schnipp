import 'reflect-metadata';
import { Path, RestController } from '../../../src/http';
import { getControllerMetaData } from '../../../src/http/decorators/getControllerMetaData';

describe('@Path', () => {
  it('should add metadata for controller', () => {
    @Path('/bar')
    class Test extends RestController {}

    expect(getControllerMetaData(Test)).toMatchSnapshot();
  });
});
