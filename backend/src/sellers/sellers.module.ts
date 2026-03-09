import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SellersController } from './controller/sellers.controller';
import { SellersService } from './services/sellers.service';
import { SellersRepository } from './repositories/sellers.repository';
import { Seller } from './entities/seller.entity';
import { SELLERS_REPOSITORY, SELLERS_SERVICE } from '../common/tokens';

@Module({
  imports: [TypeOrmModule.forFeature([Seller])],
  controllers: [SellersController],
  providers: [
    {
      provide: SELLERS_REPOSITORY,
      useClass: SellersRepository,
    },
    {
      provide: SELLERS_SERVICE,
      useClass: SellersService,
    },
  ],
  exports: [SELLERS_SERVICE, SELLERS_REPOSITORY],
})
export class SellersModule {}


