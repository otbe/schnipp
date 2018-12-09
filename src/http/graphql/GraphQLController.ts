import {
  ApolloError,
  ApolloServer,
  Config,
  CreateHandlerOptions,
  ForbiddenError,
  IResolverObject
} from 'apollo-server-lambda';
import {
  APIGatewayEvent,
  APIGatewayProxyEvent,
  APIGatewayProxyResult,
  Context,
  Handler
} from 'aws-lambda';
import { GraphQLScalarType } from 'graphql';
import {
  APIGatewayHandler,
  DecoratedExceptionFilter,
  ExceptionFilter,
  Guard,
  MetaData
} from '..';
import {
  getControllerMetaData,
  GraphQLControllerData
} from '../decorators/getControllerMetaData';
import { DefaultExecutionContext } from '../utils/ExecutionContext';
import { ResolverMethodMeta } from './decorators/method';
import { getFromContainer, ContainedType } from '../../container';
import { getResolverMetaData } from './decorators/resolver';

export abstract class GraphQLController implements APIGatewayHandler {
  private handler: Handler<
    APIGatewayEvent,
    APIGatewayProxyResult
  > | null = null;

  private controllerData = getControllerMetaData(this
    .constructor as any) as GraphQLControllerData;

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
    const resolvers = this.resolvers.reduce(
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
      const resolver = getFromContainer(resolverMeta.clazz!);

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

    const filter = getFromContainer<ExceptionFilter>(exceptionFilter.filter);

    return (await filter.catch(e, executionContext, metaData)) as
      | ApolloError
      | undefined;
  }

  private async processGuards(
    guards: Array<ContainedType<Guard>>,
    executionContext: DefaultExecutionContext | any,
    metaData: MetaData
  ) {
    const canActivate = (await Promise.all(
      guards.map(guard =>
        getFromContainer(guard).canActivate(executionContext, metaData)
      )
    )).every(Boolean);

    if (!canActivate) {
      throw new ForbiddenError('Forbidden');
    }
  }

  private get resolvers() {
    return this.getResolvers().map(resolver => getResolverMetaData(resolver));
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

  abstract getResolvers(): Array<ContainedType<any>>;
}
