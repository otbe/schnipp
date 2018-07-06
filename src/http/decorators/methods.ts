import { createHttpMethodDecorator } from '../factories/createHttpMethodDecorator';
import { HttpVerb } from '../utils/AuthPolicy';

const { GET, POST, DELETE, HEAD, OPTIONS, PATCH, PUT, ALL } = Object.keys(
  HttpVerb
).reduce<
  { [key in keyof typeof HttpVerb]: (path?: string) => MethodDecorator }
>(
  (acc: any, verb: HttpVerb) => {
    acc[verb] = createHttpMethodDecorator(verb);
    return acc;
  },
  {} as any
);

export { GET, POST, DELETE, HEAD, OPTIONS, PATCH, PUT, ALL };
