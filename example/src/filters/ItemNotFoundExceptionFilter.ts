import { Catch, createResponse } from '../../../dist/http';
import { ItemNotFoundException } from '@aws/dynamodb-data-mapper';
import { ExceptionFilter } from '../../../dist/http';

@Catch(ItemNotFoundException)
export class ItemNotFoundExceptionFilter implements ExceptionFilter {
  async catch() {
    console.log('catch');
    return createResponse(404);
  }
}
