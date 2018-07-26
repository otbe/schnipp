import { GraphQLController, Use } from '../../../dist/http/graphql';
import { inject } from 'simple-ts-di';
import { RolesGuard } from '../guards/RolesGuard';

@inject()
@Use(RolesGuard)
export class GraphqlController extends GraphQLController {}
