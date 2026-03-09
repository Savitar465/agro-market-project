import { Module } from '@nestjs/common';
import { SellersController } from './controller/sellers.controller';

@Module({
  controllers: [SellersController]
})
export class SellersModule {}
