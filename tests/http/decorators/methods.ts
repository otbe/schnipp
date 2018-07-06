import 'reflect-metadata';
import { getMethodMetaData } from '../../../src/http/factories/createHttpMethodDecorator';
import * as METHODS from '../../../src/http/decorators/methods';

describe('HTTP methods', () => {
  Object.keys(METHODS).forEach(verb => {
    describe(`@${verb}`, () => {
      it('should add metadata to functions', () => {
        const m = METHODS[verb];

        class Test {
          @m('/path')
          foo() {}
        }

        const t = new Test();
        expect(getMethodMetaData('foo', t)).toMatchSnapshot();
      });
    });
  });
});
