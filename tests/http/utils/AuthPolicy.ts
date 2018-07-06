import { AuthPolicy, HttpVerb } from '../../../src/http';

describe('AuthPolicy', () => {
  it('should parse ARN', () => {
    expect(
      AuthPolicy.parseMethodArn(
        'arn:aws:execute-api:us-east-1:random-account-id:random-api-id/dev/GET/events/*'
      )
    ).toMatchSnapshot();
  });

  it('should let me create an valid poliy document (allow)', () => {
    const o = AuthPolicy.parseMethodArn(
      'arn:aws:execute-api:us-east-1:random-account-id:random-api-id/dev/GET/events/*'
    );
    const p = new AuthPolicy('me', o.accountId, o);

    p.allowMethod(HttpVerb.DELETE, '/bar');
    p.allowMethodWithConditions(HttpVerb.DELETE, '/bar2', {
      cond: { foo: 'bar' }
    });

    p.addContext({
      foo: 'bar'
    });

    expect(p.build()).toMatchSnapshot();
  });

  it('should let me create an valid poliy document (deny)', () => {
    const o = AuthPolicy.parseMethodArn(
      'arn:aws:execute-api:us-east-1:random-account-id:random-api-id/dev/GET/events/*'
    );
    const p = new AuthPolicy('me', o.accountId, o);

    p.denyMethod(HttpVerb.DELETE, '/bar');
    p.denyMethodWithConditions(HttpVerb.DELETE, '/bar2', {
      cond: { foo: 'bar' }
    });

    p.addContext({
      foo: 'bar'
    });

    expect(p.build()).toMatchSnapshot();
  });

  it('should let me create an valid poliy document denyAll', () => {
    const o = AuthPolicy.parseMethodArn(
      'arn:aws:execute-api:us-east-1:random-account-id:random-api-id/dev/GET/events/*'
    );
    const p = new AuthPolicy('me', o.accountId, o);

    p.denyAllMethods();

    p.addContext({
      foo: 'bar'
    });

    expect(p.build()).toMatchSnapshot();
  });

  it('should let me create an valid poliy document allowAll', () => {
    const o = AuthPolicy.parseMethodArn(
      'arn:aws:execute-api:us-east-1:random-account-id:random-api-id/dev/GET/events/*'
    );
    const p = new AuthPolicy('me', o.accountId, o);

    p.allowAllMethods();

    p.addContext({
      foo: 'bar'
    });

    expect(p.build()).toMatchSnapshot();
  });

  it('should fail on empty policy', () => {
    const p = new AuthPolicy('foo', 'bar');
    expect(() => p.build()).toThrow();
  });

  it('should fail on invalid path', () => {
    const p = new AuthPolicy('foo', 'bar');
    expect(() => p.allowMethod(HttpVerb.GET, '$%&/&%$§"')).toThrow();
  });

  it('should work for only allow or deny', () => {
    const p = new AuthPolicy('foo', 'bar');
    p.allowMethod(HttpVerb.GET, '/');
    expect(p.build()).toMatchSnapshot();

    const p2 = new AuthPolicy('foo', 'bar');
    p2.denyMethod(HttpVerb.GET, '/');
    expect(p2.build()).toMatchSnapshot();
  });
});
