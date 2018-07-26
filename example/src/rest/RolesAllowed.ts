import { Meta } from '../../../dist/http/rest';

export const RolesAllowed = (...roles: Array<string>) => Meta('roles', roles);
