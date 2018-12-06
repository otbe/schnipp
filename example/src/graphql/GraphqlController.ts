import { GraphQLController, Use, Meta } from '../../../dist/http/graphql';
import { inject } from 'simple-ts-di';
import { RolesGuard } from '../guards/RolesGuard';
import events from './gql/events.gql';

@inject()
@Use(RolesGuard)
@Meta('foo', 'bar')
export class GraphqlController extends GraphQLController {
  getApolloServerOptions() {
    return { typeDefs: events };
  }
}
