import * as urlJoin from 'url-join';
import { APIGatewayEvent, Context, APIGatewayProxyResult } from 'aws-lambda';
import { Newable } from 'simple-ts-di';
import { HttpVerb } from '../utils/AuthPolicy';

const METHODS = Symbol('methods');

export type ParamInjector<T> = {
  (e: APIGatewayEvent, metaData: MetaData, context: Context): T;
};

export type InjectedParam<T> = {
  index: number;
  injector: ParamInjector<T>;
};

export interface ExceptionFilter {
  catch(
    exception: any,
    event: APIGatewayEvent,
    metaData: MetaData,
    context: Context
  ): Promise<APIGatewayProxyResult> | APIGatewayProxyResult;
}

export type DecoratedExceptionFilter = {
  exceptions: Array<any>;
  filter: Newable<ExceptionFilter>;
};

export interface Guard {
  canActivate(
    event: APIGatewayEvent,
    metaData: MetaData,
    context: Context
  ): Promise<boolean> | boolean;
}

export type MetaData = { [key: string]: any };

export type MethodMetaData = {
  statusCode?: number;
  method?: HttpVerb;
  path: string;
  propertyKey: string;
  headers: { [key: string]: string };
  paramaters: Array<InjectedParam<any>>;
  filters: Array<DecoratedExceptionFilter>;
  guards: Array<Newable<Guard>>;
  metaData: MetaData;
};

export const createHttpMethodDecorator = (method: HttpVerb) => (
  path: string = '/'
): MethodDecorator => <T>(
  target: any,
  propertyKey: string | symbol,
  descriptor: TypedPropertyDescriptor<T>
) => {
  const methodMetaData = getMethodMetaData(propertyKey.toString(), target);
  if (methodMetaData.statusCode == null) {
    methodMetaData.statusCode = method === 'POST' ? 201 : 200;
  }
  methodMetaData.method = method;
  methodMetaData.path = path;
  return descriptor;
};

export const getMethodMetaData = (propertyKey: string, controller: any) => {
  let methods: Array<MethodMetaData> | null = Reflect.getMetadata(
    METHODS,
    controller
  );

  if (methods == null) {
    methods = [];
    Reflect.defineMetadata(METHODS, methods, controller);
  }

  let data = methods.find(x => x.propertyKey === propertyKey);

  if (data == null) {
    data = {
      path: '/',
      propertyKey,
      filters: [],
      paramaters: [],
      guards: [],
      headers: {},
      metaData: {}
    };
    methods.push(data);
  }

  return data;
};

export const findMethod = (
  basePath: string,
  resourcePath: string,
  method: string,
  controller: any
) => {
  const m: Array<MethodMetaData> = Reflect.getMetadata(METHODS, controller);

  const res = m.find(
    x =>
      x.method === method &&
      urlJoin(basePath, x.path!.replace(/\/$/, '')) === resourcePath
  );

  if (res == null) {
    return m.find(x => x.method === '*');
  }

  return res;
};
