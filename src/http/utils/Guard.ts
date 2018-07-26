import { MetaData } from './MetaData';
import { DefaultExecutionContext } from './ExecutionContext';

export interface Guard {
  canActivate<Context = DefaultExecutionContext>(
    executionContext: Context,
    metaData: MetaData
  ): Promise<boolean> | boolean;
}
