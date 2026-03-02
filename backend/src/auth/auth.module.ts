import {Module} from '@nestjs/common';
import {AuthController} from './controller/auth.controller';
import {AuthService} from './services/auth.service';
import {UsersModule} from "../users/users.module";
import {JwtModule} from "@nestjs/jwt";
import {jwtConstants} from "./constants";
import {AUTH_SERVICE} from "../common/tokens";
import {APP_GUARD} from "@nestjs/core";
import {AuthGuard} from "./guards/auth.guard";
import {TokenRevocationService} from './services/token-revocation.service';

@Module({
  imports: [
    UsersModule,
    JwtModule.register({
      global: true,
      secret: jwtConstants.secret,
      signOptions: {expiresIn: '60s'},
    })
  ],
  controllers: [AuthController],
  providers: [
    {provide: AUTH_SERVICE, useClass: AuthService},
    TokenRevocationService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ]
})
export class AuthModule {
}
