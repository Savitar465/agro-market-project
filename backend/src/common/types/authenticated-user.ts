import { Role } from '../../auth/rbac/role.enum';

/** Shape of `req.user` as populated by the AuthGuard from the JWT payload. */
export interface AuthenticatedUser {
  sub: string;
  username?: string;
  roles?: Role[];
}
