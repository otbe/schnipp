import 'reflect-metadata';
import { Catch } from '../../../src/http';
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
});
