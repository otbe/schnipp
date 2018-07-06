import { inject } from 'simple-ts-di';
import { APIGatewayProxyEvent } from 'aws-lambda';
import { Guard, MetaData } from '../../../dist/http';

@inject()
export class RolesGuard implements Guard {
  canActivate(event: APIGatewayProxyEvent, metaData: MetaData) {
    if (metaData.roles) {
      return event.requestContext
        .authorizer!.roles.split(',')
        .some(x => metaData.roles.some(y => y === x));
    }

    return true;
  }
}
