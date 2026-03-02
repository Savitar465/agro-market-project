import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './controller/users.controller';
import { UsersService } from './services/users.service';
import { UsersRepository } from './repositories/users.repository';
import { User } from './entities/user.entity';
import { USERS_REPOSITORY, USERS_SERVICE } from '../common/tokens';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [
    { provide: USERS_SERVICE, useClass: UsersService },
    { provide: USERS_REPOSITORY, useClass: UsersRepository },
  ],
  exports: [USERS_SERVICE],
})
export class UsersModule {}
