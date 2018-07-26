import { ItemNotFoundException } from '@aws/dynamodb-data-mapper';
import { ExceptionFilter } from '../../../dist/http';
import { Catch } from '../../../dist/http';
import { ApolloError } from 'apollo-server-core';

@Catch(ItemNotFoundException)
export class ItemNotFoundExceptionFilter2 implements ExceptionFilter {
  async catch(e) {
    console.log('catch', e);
    return new ApolloError('not found', 'NOT_FOUND');
  }
}
