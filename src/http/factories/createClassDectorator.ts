import { DecoratedExceptionFilter, Guard, MetaData } from '..';
import { Newable } from 'simple-ts-di';

// export const createClassDecorator = (
//   decorator: (data: Partial<ControllerData>) => void
// ): ClassDecorator => (target: any) => {
//   decorator(getControllerMetaData(target));
// };

export const CONTROLLER = Symbol('controller');

export type ControllerData = {
  basePath: string;
  headers: { [key: string]: string };
  filters: Array<DecoratedExceptionFilter>;
  guards: Array<Newable<Guard>>;
  metaData: MetaData;
};

export const getControllerMetaData = (controller: any) => {
  let data: ControllerData | null = Reflect.getMetadata(CONTROLLER, controller);

  if (data == null) {
    data = {
      basePath: '/',
      filters: [],
      guards: [],
      metaData: {},
      headers: {}
    };
    Reflect.defineMetadata(CONTROLLER, data, controller);
  }

  return data;
};
