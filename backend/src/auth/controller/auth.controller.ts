import {Body, Controller, HttpCode, HttpStatus, Inject, Post, Req} from '@nestjs/common';
import {AuthService} from "../services/auth.service";
import {SigninDto} from "../dto/signin.dto";
import {AUTH_SERVICE} from "../../common/tokens";
import {Public} from "../guards/public-auth.decorator";
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(@Inject(AUTH_SERVICE) private readonly authService: AuthService) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('login')
  async signIn(@Body() dto: SigninDto ) {
    return this.authService.signIn(dto.username, dto.password)
  }

  @HttpCode(HttpStatus.OK)
  @Post('logout')
  async logout(@Req() req: Request) {
    const auth = req.headers.authorization ?? '';
    const token = auth.startsWith('Bearer ') ? auth.split(' ')[1] : undefined;
    await this.authService.logout(token as string);
    return { ok: true };
  }

}
