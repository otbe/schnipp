import { inject } from 'simple-ts-di';
import { Guard, MetaData } from '../../../dist/http';
import { DefaultExecutionContext } from '../../../dist/http/utils/ExecutionContext';

@inject()
export class RolesGuard implements Guard {
  canActivate(executionContext: DefaultExecutionContext, metaData: MetaData) {
    console.log(executionContext, metaData);
    if (metaData.roles) {
      return executionContext
        .authorizer!.roles.split(',')
        .some(x => metaData.roles.some(y => y === x));
    }

    return true;
  }
}
