import { APIGatewayHandler, createResponse } from '.';
import { CONTAINER_INSTANCE_PROP, Container, Newable } from 'simple-ts-di';
import {
  APIGatewayEvent,
  Context,
  APIGatewayProxyResult,
  APIGatewayProxyEvent
} from 'aws-lambda';
import {
  findMethod,
  MethodMetaData,
  DecoratedExceptionFilter,
  ExceptionFilter,
  Guard,
  MetaData
} from './factories/createHttpMethodDecorator';
import { HttpException } from './exceptions/HttpException';
import { ForbiddenException } from './exceptions/ForbiddenException';
import { getControllerMetaData } from './factories/createClassDectorator';

export class RestController implements APIGatewayHandler {
  private controllerData = getControllerMetaData(this.constructor);

  private get container() {
    return (this as any)[CONTAINER_INSTANCE_PROP] as Container;
  }

  async handle(
    event: APIGatewayProxyEvent,
    context: Context
  ): Promise<APIGatewayProxyResult> {
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

    try {
      await this.processGuards(guards, event, context, metaData);

      const headers = { ...this.controllerData.headers, ...method.headers };

      return createResponse(
        method.statusCode!,
        await this.generateResponse(method, event, context),
        headers
      );
    } catch (exception) {
      const filters = [...method.filters, ...this.controllerData.filters];

      const mappedExceptionResponse = await this.processFilters(
        filters,
        exception,
        event,
        context,
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
    context: Context
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
    event: APIGatewayEvent,
    context: Context,
    metaData: MetaData
  ) {
    try {
      const exceptionFilter = filters.find(x =>
        x.exceptions.some(y => e.name === y.name || e instanceof y)
      );

      if (exceptionFilter == null) {
        return;
      }

      const filter = await this.container.get<ExceptionFilter>(
        exceptionFilter.filter
      );

      return await filter.catch(e, event, metaData, context);
    } catch (e) {
      return createResponse(500, { message: 'Internal Server Error' });
    }
  }

  private async processGuards(
    guards: Array<Newable<Guard>>,
    event: APIGatewayEvent,
    context: Context,
    metaData: MetaData
  ) {
    const canActivate = (await Promise.all(
      guards.map(guard =>
        this.container
          .get(guard)
          .then(guard => guard.canActivate(event, metaData, context))
      )
    )).every(Boolean);

    if (!canActivate) {
      throw new ForbiddenException();
    }
  }
}
