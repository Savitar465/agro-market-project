import {
  ConflictException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from '../../users/services/users.service';
import { JwtService } from '@nestjs/jwt';
import {
  AuthResult,
  AuthUserInfo,
  IAuthService,
} from './auth.service.interface';
import { USERS_SERVICE } from '../../common/tokens';
import * as bcrypt from 'bcrypt';
import { TokenRevocationService } from './token-revocation.service';
import { RegisterDto } from '../dto/register.dto';
import { Role } from '../rbac/role.enum';
import { SafeUser } from '../../users/services/users.service.interface';
@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @Inject(USERS_SERVICE) private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly revocation: TokenRevocationService,
  ) {}

  async signIn(username: string, pass: string): Promise<AuthResult> {
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(pass, user.password ?? '');
    if (!isMatch) {
      throw new UnauthorizedException();
    }

    return this.buildAuthResult(user);
  }

  async register(dto: RegisterDto): Promise<AuthResult> {
    // Default to consumidor; never allow self-assigning admin (enforced by DTO).
    const role = dto.role ?? Role.User;

    const existing = await this.usersService.findOneByUsername(dto.username);
    if (existing) {
      throw new ConflictException('Username already taken');
    }

    const user = await this.usersService.create({
      name: dto.name,
      username: dto.username,
      email: dto.email,
      password: dto.password,
      roles: [role],
    });

    return this.buildAuthResult(user);
  }

  async logout(token: string): Promise<void> {
    if (!token) return;
    // decode to extract exp
    try {
      const decoded: any = this.jwtService.decode(token);
      const exp = decoded?.exp;
      this.revocation.revoke(token, exp);
    } catch {
      // if decode fails, still revoke by storing with default TTL
      this.revocation.revoke(token);
    }
  }

  private async buildAuthResult(user: SafeUser): Promise<AuthResult> {
    const payload = {
      username: user.username,
      sub: user.id,
      roles: user.roles,
    };
    const access_token = await this.jwtService.signAsync(payload);

    const userInfo: AuthUserInfo = {
      id: user.id,
      username: user.username,
      name: user.name,
      email: user.email,
      roles: user.roles ?? [],
    };

    return { access_token, user: userInfo };
  }
}

export default AuthService;
