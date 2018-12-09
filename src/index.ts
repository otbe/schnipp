import { Context, Handler } from 'aws-lambda';
import { ContainedType, getFromContainer } from './container';

export type IHandler<E, R = void> = {
  handle(event: E, context: Context): Promise<R> | R;
};

let setupPromise: Promise<any> | null = null;
export const createHandler = <E, R>(
  handler: ContainedType<IHandler<E, R>>,
  setupFn?: () => Promise<any>
): Handler<E, R> => async (event: E, context: Context) => {
  context.callbackWaitsForEmptyEventLoop = false;

  if (setupFn) {
    if (setupPromise == null) {
      setupPromise = setupFn();
    }

    await setupPromise;
  }

  const handlerInstance = getFromContainer(handler);
  return await handlerInstance.handle(event, context);
};

export { useContainer } from './container';
