import { inject } from 'simple-ts-di';
import { AuthorizeHandler, AuthPolicy, HttpVerb } from '../../../dist/http';
import { CustomAuthorizerResult, CustomAuthorizerEvent } from 'aws-lambda';

@inject()
export class EventAuthorizer implements AuthorizeHandler {
  handle(event: CustomAuthorizerEvent): CustomAuthorizerResult {
    if (event.authorizationToken == null) {
      throw 'missing auth token';
    }

    const { region, accountId, stage, restApiId } = AuthPolicy.parseMethodArn(
      event.methodArn
    );

    const policy = new AuthPolicy('me', accountId, {
      region,
      stage,
      restApiId
    });
    if (event.authorizationToken.includes('admin')) {
      policy.allowMethod(HttpVerb.POST, '/events');
    }

    policy.allowMethod(HttpVerb.GET, '/events');
    policy.allowMethod(HttpVerb.GET, '/events/*');

    policy.addContext({
      name: 'Bar',
      age: 20,
      roles: [
        event.authorizationToken.includes('admin') ? 'admin' : 'user'
      ].join(',')
    });

    if (event.authorizationToken.includes('hacker')) {
      throw 'hacked';
    }

    const p = policy.build();
    console.log(p.policyDocument.Statement.map(x => x));
    return p;
  }
}
