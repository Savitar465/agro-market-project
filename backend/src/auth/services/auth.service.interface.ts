import { RegisterDto } from '../dto/register.dto';
import { Role } from '../rbac/role.enum';

export type AuthUserInfo = {
  id: string;
  username: string;
  name: string;
  email: string;
  roles: Role[];
};

export type AuthResult = {
  access_token: string;
  user: AuthUserInfo;
};

export interface IAuthService {
  signIn(username: string, password: string): Promise<AuthResult>;
  register(dto: RegisterDto): Promise<AuthResult>;
  logout(token: string): Promise<void>;
}
