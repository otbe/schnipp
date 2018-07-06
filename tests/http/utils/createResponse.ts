import { createResponse } from '../../../src/http';

describe('createResponse', () => {
  it('should create a proper response', () => {
    expect(createResponse(200)).toMatchSnapshot();
    expect(createResponse(400, { foo: 'bar' })).toMatchSnapshot();
    expect(
      createResponse(400, { foo: 'bar' }, { Accept: 'text/html' })
    ).toMatchSnapshot();
    expect(
      createResponse(300, 'base64', { Accept: 'text/html' })
    ).toMatchSnapshot();
  });
});
