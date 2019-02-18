import { Guard, MetaData } from '../../../dist/http';

export class RolesGuard implements Guard {
  canActivate(executionContext: any, metaData: MetaData) {
    if (metaData.roles) {
      return executionContext
        .authorizer!.roles.split(',')
        .some(x => metaData.roles.some(y => y === x));
    }

    return true;
  }
}
