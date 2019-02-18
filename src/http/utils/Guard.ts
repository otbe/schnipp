import { MetaData } from './MetaData';

export interface Guard<Context = {}> {
  canActivate(
    executionContext: Context,
    metaData: MetaData
  ): Promise<boolean> | boolean;
}
