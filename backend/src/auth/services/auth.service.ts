import {Inject, Injectable, UnauthorizedException} from '@nestjs/common';
import {UsersService} from "../../users/services/users.service";
import {JwtService} from "@nestjs/jwt";
import {IAuthService} from "./auth.service.interface";
import {USERS_SERVICE} from "../../common/tokens";
import * as bcrypt from 'bcrypt';
import {TokenRevocationService} from './token-revocation.service';
@Injectable()
export class AuthService implements IAuthService {

  constructor(
    @Inject(USERS_SERVICE) private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly revocation: TokenRevocationService,
  ) {
  }

  async signIn(username: string, pass: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findOneByUsername(username);
    if (!user) {
      throw new UnauthorizedException();
    }

    const isMatch = await bcrypt.compare(pass, user.password ?? '');
    if (!isMatch) {
      throw new UnauthorizedException();
    }

    const payload = {username: user.username, sub: user.id, roles: user.roles};
    const access_token = await this.jwtService.signAsync(payload);
    return { access_token };
  }

  async logout(token: string): Promise<void> {
    if (!token) return;
    // decode to extract exp
    try {
      const decoded: any = this.jwtService.decode(token);
      const exp = decoded?.exp;
      this.revocation.revoke(token, exp);
    } catch (err) {
      // if decode fails, still revoke by storing with default TTL
      this.revocation.revoke(token);
    }
  }
}

export default AuthService;
