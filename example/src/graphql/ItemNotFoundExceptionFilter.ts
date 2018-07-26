import { createResponse } from '../../../dist/http';
import { ItemNotFoundException } from '@aws/dynamodb-data-mapper';
import { ExceptionFilter } from '../../../dist/http';
import { Catch } from '../../../dist/http';
import { GraphQLError } from 'graphql';

@Catch(ItemNotFoundException)
export class ItemNotFoundExceptionFilter2 implements ExceptionFilter {
  async catch() {
    console.log('catch');
    return new GraphQLError('not found');
  }
}
