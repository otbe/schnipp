import { createHttpMethodDecorator } from '../factories/createHttpMethodDecorator';
import { HttpVerb } from '../utils/AuthPolicy';

export const GET = createHttpMethodDecorator(HttpVerb.GET);
export const POST = createHttpMethodDecorator(HttpVerb.POST);
export const DELETE = createHttpMethodDecorator(HttpVerb.DELETE);
export const HEAD = createHttpMethodDecorator(HttpVerb.HEAD);
export const OPTIONS = createHttpMethodDecorator(HttpVerb.OPTIONS);
export const PATCH = createHttpMethodDecorator(HttpVerb.PATCH);
export const PUT = createHttpMethodDecorator(HttpVerb.PUT);
export const ALL = createHttpMethodDecorator(HttpVerb.ALL);
