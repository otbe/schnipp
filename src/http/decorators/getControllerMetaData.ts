import { MetaData, Guard, DecoratedExceptionFilter } from '..';
import { Newable } from 'simple-ts-di';
import { RestController } from '../rest';
import { GraphQLController } from '../graphql';
import { ResolverMeta } from '../graphql/decorators/method';

export const CONTROLLER = Symbol('controller');

export type ControllerBaseData = {
  headers: { [key: string]: string };
  filters: Array<DecoratedExceptionFilter>;
  guards: Array<Newable<Guard>>;
  metaData: MetaData;
};

export type GraphQLControllerData = ControllerBaseData & {
  resolvers?: Array<ResolverMeta>;
};

export type RestControllerData = ControllerBaseData & {
  basePath?: string;
};

export type ControllerData = GraphQLControllerData | RestControllerData;

export const getControllerMetaData = (
  controller: typeof RestController | typeof GraphQLController
) => {
  let data: ControllerData | null = Reflect.getMetadata(CONTROLLER, controller);

  if (data == null) {
    data = {
      filters: [],
      guards: [],
      metaData: {},
      headers: {}
    };

    Reflect.defineMetadata(CONTROLLER, data, controller);
  }

  return data;
};
