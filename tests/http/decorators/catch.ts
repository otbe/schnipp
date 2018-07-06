import 'reflect-metadata';
import { Catch } from '../../../src/http';
import { Module, Bind, Container } from 'simple-ts-di';
import { getCaughtExceptions } from '../../../src/http/decorators/catch';

describe('@Catch', () => {
  class Service {}

  @Catch(Error)
  class Test {
    constructor(public service: Service) {}

    catch() {}
  }

  it('should define caught expcetions', () => {
    expect(getCaughtExceptions(Test)).toMatchSnapshot();
  });

  it('should make filter injectable', async () => {
    class MyModule implements Module {
      init(bind: Bind) {
        bind(Test);
        bind(Service);
      }
    }

    const c = new Container(new MyModule());
    const f = await c.get(Test);
    expect(f.service).toBeTruthy();
    expect(f.service).toBeInstanceOf(Service);
  });
});
