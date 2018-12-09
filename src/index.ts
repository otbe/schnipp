import { Context, Handler } from 'aws-lambda';
import { ContainedType, getFromContainer } from './container';

export type IHandler<E, R = void> = {
  handle(event: E, context: Context): Promise<R> | R;
};

export const createHandler = <E, R>(
  handler: ContainedType<IHandler<E, R>>
): Handler<E, R> => async (event: E, context: Context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  const handlerInstance = getFromContainer(handler);
  return await handlerInstance.handle(event, context);
};

export { useContainer } from './container';
