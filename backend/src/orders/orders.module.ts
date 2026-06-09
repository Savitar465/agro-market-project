import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrdersController } from './controller/orders.controller';
import { OrdersService } from './services/orders.service';
import { OrdersRepository } from './repositories/orders.repository';
import { ORDERS_REPOSITORY, ORDERS_SERVICE } from '../common/tokens';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { SellersModule } from '../sellers/sellers.module';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem]), SellersModule],
  controllers: [OrdersController],
  providers: [
    { provide: ORDERS_SERVICE, useClass: OrdersService },
    { provide: ORDERS_REPOSITORY, useClass: OrdersRepository },
  ],
  exports: [ORDERS_SERVICE],
})
export class OrdersModule {}
