import {
  APIGatewayEvent,
  Context,
  APIGatewayProxyResult,
  APIGatewayProxyEvent
} from 'aws-lambda';
import {
  findMethod,
  MethodMetaData
} from './factories/createHttpMethodDecorator';
import { HttpException } from './exceptions/HttpException';
import { ForbiddenException } from './exceptions/ForbiddenException';
import {
  APIGatewayHandler,
  createResponse,
  DecoratedExceptionFilter,
  MetaData,
  ExceptionFilter,
  Guard
} from '..';
import { DefaultExecutionContext } from '../utils/ExecutionContext';
import {
  getControllerMetaData,
  RestControllerData
} from '../decorators/getControllerMetaData';
import { getFromContainer, ContainedType } from '../../container';

export class RestController implements APIGatewayHandler {
  private controllerData = getControllerMetaData(this
    .constructor as any) as RestControllerData;

  async handle(
    event: APIGatewayProxyEvent,
    lambdaContext: Context
  ): Promise<APIGatewayProxyResult> {
    if (this.controllerData.basePath == null) {
      throw 'no @Path annotation';
    }

    const method = findMethod(
      this.controllerData.basePath,
      event.resource,
      event.httpMethod,
      this
    );

    if (method == null) {
      return createResponse(404);
    }

    const guards = [...method.guards, ...this.controllerData.guards];
    const metaData = { ...this.controllerData.metaData, ...method.metaData };
    const executionContext = await this.createExecutionContext(
      event,
      lambdaContext
    );

    try {
      await this.processGuards(guards, executionContext, metaData);

      const headers = { ...this.controllerData.headers, ...method.headers };

      return createResponse(
        method.statusCode!,
        await this.generateResponse(method, event, lambdaContext),
        headers
      );
    } catch (exception) {
      const filters = [...method.filters, ...this.controllerData.filters];

      const mappedExceptionResponse = await this.processFilters(
        filters,
        exception,
        executionContext,
        metaData
      );

      if (mappedExceptionResponse != null) {
        return mappedExceptionResponse;
      }

      if (exception instanceof HttpException) {
        return createResponse(exception.statusCode, {
          statusCode: exception.statusCode,
          message: exception.message
        });
      }

      return createResponse(500, {
        statusCode: 500,
        message: 'Internal Server Error'
      });
    }
  }

  private async generateResponse(
    method: MethodMetaData,
    event: APIGatewayEvent,
    context: any
  ) {
    return await (this as any)[method.propertyKey].apply(
      this,
      method.paramaters
        .sort((a, b) => a.index - b.index)
        .map(r => r.injector(event, method.metaData, context))
    );
  }

  private async processFilters(
    filters: Array<DecoratedExceptionFilter>,
    e: any,
    executionContext: DefaultExecutionContext | any,
    metaData: MetaData
  ) {
    try {
      const exceptionFilter = filters.find(x =>
        x.exceptions.some(y => e.name === y.name || e instanceof y)
      );

      if (exceptionFilter == null) {
        return;
      }

      const filter = getFromContainer<ExceptionFilter>(exceptionFilter.filter);

      return (await filter.catch(e, executionContext, metaData)) as
        | APIGatewayProxyResult
        | undefined;
    } catch (e) {
      return createResponse(500, { message: 'Internal Server Error' });
    }
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
      throw new ForbiddenException();
    }
  }

  async createExecutionContext(
    event: APIGatewayEvent,
    lambdaContext: Context
  ): Promise<DefaultExecutionContext | any> {
    return { authorizer: event.requestContext.authorizer };
  }
}
