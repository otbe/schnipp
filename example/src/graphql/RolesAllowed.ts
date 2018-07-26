import { Meta } from '../../../dist/http/graphql';

export const RolesAllowed = (...roles: Array<string>) => Meta('roles', roles);
