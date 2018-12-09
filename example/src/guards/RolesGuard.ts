import { Guard, MetaData } from '../../../dist/http';
import { DefaultExecutionContext } from '../../../dist/http/utils/ExecutionContext';

export class RolesGuard implements Guard {
  canActivate(executionContext: DefaultExecutionContext, metaData: MetaData) {
    if (metaData.roles) {
      return executionContext
        .authorizer!.roles.split(',')
        .some(x => metaData.roles.some(y => y === x));
    }

    return true;
  }
}
