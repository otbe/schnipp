import { CustomAuthorizerResult, Statement, ConditionBlock } from 'aws-lambda';
import * as urlJoin from 'url-join';

export enum HttpVerb {
  GET = 'GET',
  POST = 'POST',
  PUT = 'PUT',
  PATCH = 'PATCH',
  HEAD = 'HEAD',
  DELETE = 'DELETE',
  OPTIONS = 'OPTIONS',
  ALL = '*'
}

export enum Effect {
  Allow = 'Allow',
  Deny = 'Deny'
}

type ApiOptions = {
  restApiId?: string;
  stage?: string;
  region?: string;
};

type AuthResponseContext = {
  [name: string]: string | number | boolean;
};

const pathRegex = new RegExp('^[/.a-zA-Z0-9-*]+$');

export class AuthPolicy {
  private restApiId = '*';
  private region = '*';
  private stage = '*';
  /**
   * The policy version used for the evaluation. This should always be "2012-10-17"
   *
   * @property version
   * @type {String}
   * @default "2012-10-17"
   */
  private readonly version: string = '2012-10-17';

  private readonly allowMethods: Array<{
    resourceArn: string;
    conditions?: ConditionBlock;
  }> = [];

  private readonly denyMethods: Array<{
    resourceArn: string;
    conditions?: ConditionBlock;
  }> = [];

  private context: AuthResponseContext = {};

  constructor(
    private readonly principalId: string,
    private readonly awsAccountId: string,
    apiOptions: ApiOptions = {}
  ) {
    if (apiOptions.restApiId) {
      this.restApiId = apiOptions.restApiId;
    }
    if (apiOptions.region) {
      this.region = apiOptions.region;
    }
    if (apiOptions.stage) {
      this.stage = apiOptions.stage;
    }
  }

  static parseMethodArn(methodArn: string) {
    const [, , , region, accountId, apiGatewayArn] = methodArn.split(':');
    const [restApiId, stage, method] = apiGatewayArn.split('/');

    return { region, accountId, restApiId, stage, method };
  }

  /**
   * Adds a method to the internal lists of allowed or denied methods. Each object in
   * the internal list contains a resource ARN and a condition statement. The condition
   * statement can be null.
   */
  private addMethod(
    effect: Effect,
    verb: HttpVerb,
    resource: string,
    conditions: ConditionBlock | undefined = undefined
  ) {
    if (!pathRegex.test(resource)) {
      throw new Error(
        `Invalid resource path: ${resource}. Path should match ${pathRegex}`
      );
    }

    const resourceArn = `arn:aws:execute-api:${this.region}:${
      this.awsAccountId
    }:${urlJoin(this.restApiId, this.stage, verb, resource)}`;

    switch (effect) {
      case Effect.Allow:
        this.allowMethods.push({
          resourceArn,
          conditions
        });
      case Effect.Deny:
        this.denyMethods.push({
          resourceArn,
          conditions
        });
    }
  }

  addContext(context: AuthResponseContext) {
    this.context = context;
  }

  /**
   * Adds an allow "*" statement to the policy.
   */
  allowAllMethods() {
    this.addMethod(Effect.Allow, HttpVerb.ALL, '*');
  }

  /**
   * Adds a deny "*" statement to the policy.
   */
  denyAllMethods() {
    this.addMethod(Effect.Deny, HttpVerb.ALL, '*');
  }

  /**
   * Adds an API Gateway method (Http verb + Resource path) to the list of allowed
   * methods for the policy
   */
  allowMethod(verb: HttpVerb, resource: string): void {
    this.addMethod(Effect.Allow, verb, resource);
  }

  /**
   * Adds an API Gateway method (Http verb + Resource path) to the list of denied
   * methods for the policy
   */
  denyMethod(verb: HttpVerb, resource: string): void {
    this.addMethod(Effect.Deny, verb, resource);
  }

  /**
   * Adds an API Gateway method (Http verb + Resource path) to the list of allowed
   * methods and includes a condition for the policy statement. More on AWS policy
   * conditions here: http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#Condition
   */
  allowMethodWithConditions(
    verb: HttpVerb,
    resource: string,
    conditions: ConditionBlock
  ): void {
    this.addMethod(Effect.Allow, verb, resource, conditions);
  }

  /**
   * Adds an API Gateway method (Http verb + Resource path) to the list of denied
   * methods and includes a condition for the policy statement. More on AWS policy
   * conditions here: http://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_elements.html#Condition
   */
  denyMethodWithConditions(
    verb: HttpVerb,
    resource: string,
    conditions: ConditionBlock
  ): void {
    this.addMethod(Effect.Deny, verb, resource, conditions);
  }

  /**
   * Generates the policy document based on the internal lists of allowed and denied
   * conditions. This will generate a policy with two main statements for the effect:
   * one statement for Allow and one statement for Deny.
   * Methods that includes conditions will have their own statement in the policy.
   */
  build(): CustomAuthorizerResult {
    if (this.allowMethods.length === 0 && this.denyMethods.length === 0) {
      throw new Error('No statements defined for the policy');
    }

    const policy: CustomAuthorizerResult = {
      principalId: this.principalId,
      policyDocument: {
        Version: this.version,
        Statement: this.getStatementsForEffect(Effect.Allow).concat(
          this.getStatementsForEffect(Effect.Deny)
        )
      },
      context: this.context
    };

    return policy;
  }

  /**
   * Returns an empty statement object prepopulated with the correct action and the
   * desired effect
   */
  private getEmptyStatement(effect: Effect) {
    const statement: Statement & { Resource: string[] } = {
      Action: 'execute-api:Invoke',
      Effect: effect,
      Resource: []
    };

    return statement;
  }

  /**
   * This function loops over an array of objects containing a resourceArn and
   * conditions statement and generates the array of statements for the policy.
   */
  private getStatementsForEffect(effect: Effect): Array<Statement> {
    const statements: Array<Statement> = [];

    const methods =
      effect === Effect.Allow ? this.allowMethods : this.denyMethods;

    if (methods.length > 0) {
      const statement = this.getEmptyStatement(effect);

      for (const curMethod of methods) {
        if (curMethod.conditions == null) {
          statement.Resource.push(curMethod.resourceArn);
        } else {
          const conditionalStatement = this.getEmptyStatement(effect);
          conditionalStatement.Resource.push(curMethod.resourceArn);
          conditionalStatement.Condition = curMethod.conditions;
          statements.push(conditionalStatement);
        }
      }

      statements.push(statement);
    }

    return statements;
  }
}
