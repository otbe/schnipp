import 'reflect-metadata';
import { Module, Bind, Container } from 'simple-ts-di';
import { Path, RestController } from '../../../../src/http/rest';
import { getControllerMetaData } from '../../../../src/http/decorators/getControllerMetaData';

describe('@Path', () => {
  it('should add metadata for controller', () => {
    @Path('/bar')
    class Test extends RestController {}

    expect(getControllerMetaData(Test)).toMatchSnapshot();
  });

  it('should let me inject deps via constructor', async () => {
    class Service {
      sayHi() {
        return 'hi';
      }
    }

    @Path('/bar')
    class Test {
      constructor(public service: Service) {}
    }

    class MyModule implements Module {
      init(bind: Bind) {
        bind(Service);
        bind(Test);
      }
    }

    const c = new Container(new MyModule());

    const t = await c.get(Test);

    expect(t.service).toBeTruthy();
    expect(t.service.sayHi()).toBe('hi');
  });
});
