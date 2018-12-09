import { DecoratedExceptionFilter, Guard, MetaData } from '..';
import { ContainedType } from '../../container';
import { GraphQLController } from '../graphql';
import { RestController } from '../rest';

export const CONTROLLER = Symbol('controller');

export type ControllerBaseData = {
  headers: { [key: string]: string };
  filters: Array<DecoratedExceptionFilter>;
  guards: Array<ContainedType<Guard>>;
  metaData: MetaData;
};

export type GraphQLControllerData = ControllerBaseData;

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
