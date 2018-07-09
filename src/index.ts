import { Context, Handler } from 'aws-lambda';
import { Container, Identifier } from 'simple-ts-di';

export type IHandler<E, R = void> = {
  handle(event: E, context: Context): Promise<R> | R;
};

export const createHandler = <E, R>(
  container: Container,
  handler: Identifier<IHandler<E, R>>
): Handler<E, R> => async (event: E, context: Context) => {
  const handlerInstance = await container.get(handler);
  return await handlerInstance.handle(event, context);
};
