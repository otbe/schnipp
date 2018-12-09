import { GraphQLController, Use, Meta } from '../../../dist/http/graphql';
import { RolesGuard } from '../guards/RolesGuard';
import events from './gql/events.gql';
import { EventResolver } from './EventResolver';

@Use(RolesGuard)
@Meta('foo', 'bar')
export class GraphqlController extends GraphQLController {
  getApolloServerOptions() {
    return { typeDefs: events };
  }

  getResolvers() {
    return [EventResolver];
  }
}
