import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { UpdateProductStatusDto } from '../dto/update-product-status.dto';
import { UpdateStockDto } from '../dto/update-stock.dto';
import { FilterProductDto } from '../dto/filter-product.dto';
import { FilterProductBySellerDto } from '../dto/filter-product-by-seller.dto';
import { IProductsService } from '../services/products.service.interface';
import { PRODUCTS_SERVICE } from '../../common/tokens';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../../auth/rbac/roles.decorator';
import { Role } from '../../auth/rbac/role.enum';
import { Public } from '../../auth/guards/public-auth.decorator';
import { AuthenticatedUser } from '../../common/types/authenticated-user';

@ApiTags('products')
@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(
    @Inject(PRODUCTS_SERVICE)
    private readonly productsService: IProductsService,
  ) {}

  @Post()
  @Roles(Role.Admin, Role.Seller)
  @ApiOperation({ summary: 'Create a new product' })
  @ApiResponse({ status: 201, description: 'Product created successfully' })
  create(
    @Body() dto: CreateProductDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.productsService.create(dto, req.user);
  }

  @Get('search')
  @Public()
  @ApiOperation({ summary: 'Search and filter products with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Filtered products with pagination data',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array' },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  findWithFilters(@Query() filters: FilterProductDto) {
    return this.productsService.findWithFilters(filters);
  }

  @Get('mine')
  @Roles(Role.Admin, Role.Seller)
  @ApiOperation({
    summary: "Get the authenticated seller's own inventory (all statuses)",
  })
  @ApiResponse({ status: 200, description: 'Products owned by the seller' })
  findMine(@Request() req: { user: AuthenticatedUser }) {
    return this.productsService.findMine(req.user);
  }

  @Get('by-seller/:sellerId')
  @Public()
  @ApiOperation({ summary: 'Filter products by seller with pagination' })
  @ApiResponse({
    status: 200,
    description: 'Products filtered by seller with pagination data',
    schema: {
      type: 'object',
      properties: {
        data: { type: 'array' },
        total: { type: 'number' },
        page: { type: 'number' },
        limit: { type: 'number' },
      },
    },
  })
  findBySeller(
    @Param('sellerId', ParseUUIDPipe) sellerId: string,
    @Query() filters: FilterProductBySellerDto,
  ) {
    return this.productsService.findBySeller({ ...filters, sellerId });
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all published products' })
  @ApiResponse({ status: 200, description: 'List of all published products' })
  findAll() {
    return this.productsService.findAll();
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a product by id' })
  @ApiResponse({ status: 200, description: 'Product found' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Seller)
  @ApiOperation({ summary: 'Update a product' })
  @ApiResponse({ status: 200, description: 'Product updated successfully' })
  @ApiResponse({ status: 403, description: 'Not the owner of this product' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.productsService.update(id, dto, req.user);
  }

  @Patch(':id/status')
  @Roles(Role.Admin, Role.Seller)
  @ApiOperation({ summary: 'Publish or suspend a product' })
  @ApiResponse({ status: 200, description: 'Product status updated' })
  @ApiResponse({ status: 403, description: 'Not the owner of this product' })
  setStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateProductStatusDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.productsService.setStatus(id, dto.status, req.user);
  }

  @Patch(':id/stock')
  @Roles(Role.Admin, Role.Seller)
  @ApiOperation({ summary: 'Update a product stock level (inventory)' })
  @ApiResponse({ status: 200, description: 'Stock updated' })
  @ApiResponse({ status: 403, description: 'Not the owner of this product' })
  setStock(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateStockDto,
    @Request() req: { user: AuthenticatedUser },
  ) {
    return this.productsService.setStock(id, dto.stock, req.user);
  }

  @Delete(':id')
  @Roles(Role.Admin, Role.Seller)
  @ApiOperation({ summary: 'Delete a product (soft delete)' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 403, description: 'Not the owner of this product' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(
    @Param('id', ParseUUIDPipe) id: string,
    @Request() req: { user: AuthenticatedUser },
  ) {
    await this.productsService.remove(id, req.user);
    return { message: `Product ${id} removed successfully` };
  }
}
