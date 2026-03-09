import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Patch, Post, Query, Request } from '@nestjs/common';
import { CreateProductDto } from '../dto/create-product.dto';
import { UpdateProductDto } from '../dto/update-product.dto';
import { FilterProductDto } from '../dto/filter-product.dto';
import { IProductsService } from '../services/products.service.interface';
import { PRODUCTS_SERVICE } from '../../common/tokens';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/rbac/roles.decorator';
import { Role } from '../../auth/rbac/role.enum';
import { Public } from '../../auth/guards/public-auth.decorator';

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
  create(@Body() dto: CreateProductDto, @Request() req: any) {
    const userId = req.user?.sub || 'system';
    return this.productsService.create(dto, userId);
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
      }
    }
  })
  findWithFilters(@Query() filters: FilterProductDto) {
    return this.productsService.findWithFilters(filters);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all products' })
  @ApiResponse({ status: 200, description: 'List of all products' })
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
  @ApiResponse({ status: 404, description: 'Product not found' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateProductDto, @Request() req: any) {
    const userId = req.user?.sub || 'system';
    return this.productsService.update(id, dto, userId);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete a product (soft delete)' })
  @ApiResponse({ status: 200, description: 'Product deleted successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.productsService.remove(id);
    return { message: `Product ${id} removed successfully` };
  }
}
