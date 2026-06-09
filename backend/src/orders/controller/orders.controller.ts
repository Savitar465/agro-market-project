import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Request,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ORDERS_SERVICE } from '../../common/tokens';
import { IOrdersService } from '../services/orders.service.interface';
import { UpdateOrderStatusDto } from '../dto/update-order-status.dto';
import { Roles } from '../../auth/rbac/roles.decorator';
import { Role } from '../../auth/rbac/role.enum';
import { AuthenticatedUser } from '../../common/types/authenticated-user';

@ApiTags('orders')
@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(
    @Inject(ORDERS_SERVICE)
    private readonly ordersService: IOrdersService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Order history of the authenticated buyer' })
  @ApiResponse({ status: 200, description: 'Orders returned, newest first' })
  findMine(@Request() req: { user: AuthenticatedUser }) {
    return this.ordersService.findMine(req.user.sub);
  }

  @Get('sales')
  @Roles(Role.Admin, Role.Seller)
  @ApiOperation({
    summary: 'Incoming orders that include the seller products (admin: all)',
  })
  @ApiResponse({ status: 200, description: 'Sales orders returned' })
  findSales(@Request() req: { user: AuthenticatedUser }) {
    return this.ordersService.findSales(req.user);
  }

  @Get(':orderId')
  @ApiOperation({ summary: 'Get a single order (status + confirmation)' })
  @ApiResponse({ status: 200, description: 'Order returned' })
  @ApiResponse({ status: 404, description: 'Order not found' })
  findOne(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.ordersService.findOneForUser(req.user.sub, orderId);
  }

  @Patch(':orderId/status')
  @Roles(Role.Admin, Role.Seller)
  @ApiOperation({ summary: 'Advance the fulfillment status of an order' })
  @ApiResponse({ status: 200, description: 'Order status updated' })
  @ApiResponse({ status: 403, description: 'Not allowed / invalid transition' })
  updateStatus(
    @Param('orderId', ParseUUIDPipe) orderId: string,
    @Body() dto: UpdateOrderStatusDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.ordersService.updateStatus(orderId, dto.status, req.user);
  }
}
