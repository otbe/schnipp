import 'reflect-metadata';
import { Path } from '../../../src/http';
import { getControllerMetaData } from '../../../src/http/factories/createClassDectorator';
import { Module, Bind, Container } from 'simple-ts-di';

describe('@Path', () => {
  it('should add metadata for controller', () => {
    @Path('/bar')
    class Test {}

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
