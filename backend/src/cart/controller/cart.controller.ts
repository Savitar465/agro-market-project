import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Patch, Post, Request } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CART_SERVICE } from '../../common/tokens';
import { ICartService } from '../services/cart.service.interface';
import { AddCartItemDto } from '../dto/add-cart-item.dto';
import { UpdateCartItemDto } from '../dto/update-cart-item.dto';

@ApiTags('cart')
@ApiBearerAuth()
@Controller('cart')
export class CartController {
  constructor(
    @Inject(CART_SERVICE)
    private readonly cartService: ICartService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get active cart for authenticated user' })
  @ApiResponse({ status: 200, description: 'Open cart returned' })
  getOpenCart(@Request() req: any) {
    return this.cartService.getOpenCart(req.user.sub);
  }

  @Post('items')
  @ApiOperation({ summary: 'Add item to active cart' })
  @ApiResponse({ status: 201, description: 'Item added to cart' })
  addItem(@Body() dto: AddCartItemDto, @Request() req: any) {
    return this.cartService.addItem(req.user.sub, dto);
  }

  @Patch('items/:itemId')
  @ApiOperation({ summary: 'Update cart item quantity' })
  @ApiResponse({ status: 200, description: 'Cart item updated' })
  updateItem(
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() dto: UpdateCartItemDto,
    @Request() req: any,
  ) {
    return this.cartService.updateItem(req.user.sub, itemId, dto);
  }

  @Delete('items/:itemId')
  @ApiOperation({ summary: 'Remove one item from active cart' })
  @ApiResponse({ status: 200, description: 'Cart item removed' })
  removeItem(@Param('itemId', ParseUUIDPipe) itemId: string, @Request() req: any) {
    return this.cartService.removeItem(req.user.sub, itemId);
  }

  @Delete('items')
  @ApiOperation({ summary: 'Clear all items in active cart' })
  @ApiResponse({ status: 200, description: 'Cart cleared' })
  clear(@Request() req: any) {
    return this.cartService.clear(req.user.sub);
  }

  @Post('checkout')
  @ApiOperation({ summary: 'Checkout active cart and discount stock' })
  @ApiResponse({ status: 200, description: 'Checkout completed' })
  checkout(@Request() req: any) {
    return this.cartService.checkout(req.user.sub);
  }
}

