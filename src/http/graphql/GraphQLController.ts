import { CONTAINER_INSTANCE_PROP, Container, Newable } from 'simple-ts-di';
import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
  APIGatewayEvent
} from 'aws-lambda';
import { graphqlLambda } from 'apollo-server-lambda';
import {
  APIGatewayHandler,
  Guard,
  MetaData,
  DecoratedExceptionFilter,
  ExceptionFilter
} from '..';
import {
  IResolverObject,
  makeExecutableSchema,
  SchemaDirectiveVisitor
} from 'graphql-tools';
import { readFile } from 'fs';
import { flatten } from 'lodash';
import { DefaultExecutionContext } from '../utils/ExecutionContext';
import {
  getControllerMetaData,
  GraphQLControllerData
} from '../decorators/getControllerMetaData';
import { GraphQLError } from 'graphql';
import { ResolverMethodMeta } from './decorators/method';

const { mergeTypes } = require('merge-graphql-schemas');

export abstract class GraphQLController implements APIGatewayHandler {
  private controllerData = getControllerMetaData(this
    .constructor as any) as GraphQLControllerData;

  private get container() {
    return (this as any)[CONTAINER_INSTANCE_PROP] as Container;
  }

  async handle(
    event: APIGatewayProxyEvent,
    lambdaContext: Context
  ): Promise<APIGatewayProxyResult> {
    const schema = await this._createSchema();
    const context = await this.createExecutionContext(event, lambdaContext);

    const handler = graphqlLambda({
      schema,
      context
    });

    return await new Promise<APIGatewayProxyResult>((resolve, reject) => {
      handler(event, lambdaContext, (err, output) => {
        if (err) {
          return reject(err);
        }

        const headers = this.controllerData.headers || {};
        output.headers = { ...output.headers, ...headers };

        resolve(output);
      });
    });
  }

  private async _createSchema() {
    const resolver = this.controllerData.resolver;
    if (resolver == null) {
      throw 'no resolver found';
    }

    const typesArray = await Promise.all(
      flatten(resolver.map(x => x.schemaPath).filter(Boolean) as Array<
        Array<string>
      >).map(
        x =>
          new Promise(resolve =>
            readFile(x, (err, res) => resolve(res.toString()))
          )
      )
    );

    const typeDefs = mergeTypes(typesArray, { all: true });

    const resolvers = resolver.reduce(
      (acc, curr) => {
        Object.keys(curr.resolverMap).forEach(typeName => {
          acc[typeName] = acc[typeName] || {};
          Object.keys(curr.resolverMap[typeName]).forEach(fieldName => {
            const resolverMeta = curr.resolverMap[typeName][fieldName];
            acc[typeName][fieldName] = this.createResolver(resolverMeta);
          });
        });

        return acc;
      },
      {} as { [typeName: string]: IResolverObject }
    );

    return makeExecutableSchema({
      typeDefs,
      resolvers,
      schemaDirectives: this.getSchemaDirectives()
    });
  }

  private createResolver(resolverMeta: ResolverMethodMeta<any>) {
    return async (source: any, args: any, context: any, info: any) => {
      const resolver = await this.container.get(resolverMeta.clazz!);

      const guards = [
        ...(resolverMeta.guards || []),
        ...this.controllerData.guards
      ];

      const metaData = {
        ...this.controllerData.metaData,
        ...(resolverMeta.metaData || {})
      };

      try {
        await this.processGuards(guards, context, metaData);

        return await resolver[resolverMeta.methodName!].call(
          resolver,
          source,
          args,
          context,
          info
        );
      } catch (exception) {
        const filters = [
          ...(resolverMeta.filters || []),
          ...this.controllerData.filters
        ];

        const mappedExceptionResponse = await this.processFilters(
          filters,
          exception,
          context,
          metaData
        );

        if (mappedExceptionResponse != null) {
          throw mappedExceptionResponse;
        }

        if (exception instanceof GraphQLError) {
          throw exception;
        }

        throw new GraphQLError('Internal Server Error');
      }
    };
  }

  private async processFilters(
    filters: Array<DecoratedExceptionFilter>,
    e: any,
    executionContext: DefaultExecutionContext | any,
    metaData: MetaData
  ) {
    const exceptionFilter = filters.find(x =>
      x.exceptions.some(y => e.name === y.name || e instanceof y)
    );

    if (exceptionFilter == null) {
      return;
    }

    const filter = await this.container.get<ExceptionFilter>(
      exceptionFilter.filter
    );

    return (await filter.catch(e, executionContext, metaData)) as
      | GraphQLError
      | undefined;
  }

  private async processGuards(
    guards: Array<Newable<Guard>>,
    executionContext: DefaultExecutionContext | any,
    metaData: MetaData
  ) {
    const canActivate = (await Promise.all(
      guards.map(guard =>
        this.container
          .get(guard)
          .then(guard => guard.canActivate(executionContext, metaData))
      )
    )).every(Boolean);

    if (!canActivate) {
      throw new GraphQLError('Forbidden');
    }
  }

  async createExecutionContext(
    event: APIGatewayEvent,
    lambdaContext: Context
  ): Promise<DefaultExecutionContext | any> {
    return { authorizer: event.requestContext.authorizer };
  }

  getSchemaDirectives(): {
    [name: string]: typeof SchemaDirectiveVisitor;
  } {
    return {};
  }
}
