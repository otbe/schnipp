import { GraphQLController, Use, Meta } from '../../../dist/http/graphql';
import { inject } from 'simple-ts-di';
import { RolesGuard } from '../guards/RolesGuard';

@inject()
@Use(RolesGuard)
@Meta('foo', 'bar')
export class GraphqlController extends GraphQLController {}
