import {Module} from '@nestjs/common';
import {UsersModule} from './users/users.module';
import {ProductsModule} from './products/products.module';
import {TypeOrmModule} from "@nestjs/typeorm";
import {configService} from "./config/config.service";
import {AuthModule} from './auth/auth.module';
import {ThrottlerGuard, ThrottlerModule} from "@nestjs/throttler";
import {APP_GUARD} from "@nestjs/core";
import { SellersModule } from './sellers/sellers.module';

@Module({
  imports: [
    UsersModule,
    ProductsModule,
    SellersModule,
    AuthModule,
    SellersModule,
    TypeOrmModule.forRoot(configService.getTypeOrmConfig()),
    ThrottlerModule.forRoot({
      throttlers: [
        {
          ttl: 60000,
          limit: 10,
        },
      ],
    })
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
