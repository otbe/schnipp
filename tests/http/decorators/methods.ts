import 'reflect-metadata';
import * as METHODS from '../../../src/http/decorators/methods';
import { getMethodMetaData } from '../../../src/http/factories/createHttpMethodDecorator';

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
