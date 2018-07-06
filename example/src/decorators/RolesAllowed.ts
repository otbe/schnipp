import { Meta } from '../../../dist/http';

export const RolesAllowed = (...roles: Array<string>) => Meta('roles', roles);
