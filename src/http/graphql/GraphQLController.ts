import { CONTAINER_INSTANCE_PROP, Container, Newable } from 'simple-ts-di';
import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
  APIGatewayEvent,
  Handler
} from 'aws-lambda';
import {
  ApolloServer,
  CreateHandlerOptions,
  ForbiddenError,
  ApolloError,
  Config,
  IResolverObject
} from 'apollo-server-lambda';
import {
  APIGatewayHandler,
  Guard,
  MetaData,
  DecoratedExceptionFilter,
  ExceptionFilter
} from '..';
import { DefaultExecutionContext } from '../utils/ExecutionContext';
import {
  getControllerMetaData,
  GraphQLControllerData
} from '../decorators/getControllerMetaData';
import { ResolverMethodMeta } from './decorators/method';
import { GraphQLScalarType, GraphQLScalarTypeConfig } from 'graphql';

const { mergeTypes } = require('merge-graphql-schemas');

export abstract class GraphQLController implements APIGatewayHandler {
  private handler: Handler<
    APIGatewayEvent,
    APIGatewayProxyResult
  > | null = null;

  private controllerData = getControllerMetaData(this
    .constructor as any) as GraphQLControllerData;

  private get container() {
    return (this as any)[CONTAINER_INSTANCE_PROP] as Container;
  }

  async handle(
    event: APIGatewayProxyEvent,
    lambdaContext: Context
  ): Promise<APIGatewayProxyResult> {
    if (this.handler == null) {
      this.handler = await this.createHandler();
    }

    return await new Promise<APIGatewayProxyResult>((resolve, reject) => {
      this.handler!(event, lambdaContext, (err, output) => {
        if (err != null) {
          return reject(err);
        }

        if (output == null) {
          return reject();
        }

        const headers = this.controllerData.headers || {};
        output.headers = { ...output.headers, ...headers };

        resolve(output);
      });
    });
  }

  private async createHandler() {
    const resolver = this.controllerData.resolvers;
    if (resolver == null) {
      throw 'no resolver found';
    }

    const typesArray = resolver.map(x => x.document).filter(Boolean);
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

    const server = new ApolloServer({
      ...this.getApolloServerOptions(),
      typeDefs,
      resolvers: { ...resolvers, ...this.getGraphQLScalars() },
      context: ({
        event,
        context
      }: {
        event: APIGatewayEvent;
        context: Context;
      }) => this.createExecutionContext(event, context)
    });

    return server.createHandler(this.getHandlerOptions());
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

        if (exception instanceof ApolloError) {
          throw exception;
        }

        throw new ApolloError('Internal Server Error');
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
      | ApolloError
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
      throw new ForbiddenError('Forbidden');
    }
  }

  async createExecutionContext(
    event: APIGatewayEvent,
    lambdaContext: Context
  ): Promise<DefaultExecutionContext | any> {
    return { authorizer: event.requestContext.authorizer };
  }

  getApolloServerOptions(): Config {
    return {};
  }

  getHandlerOptions(): CreateHandlerOptions | undefined {
    return;
  }

  getGraphQLScalars(): { [name: string]: GraphQLScalarType } {
    return {};
  }
}
