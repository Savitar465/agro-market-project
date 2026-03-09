import { Body, Controller, Delete, Get, Inject, Param, ParseUUIDPipe, Patch, Post, Request } from '@nestjs/common';
import { CreateSellerDto } from '../dto/create-seller.dto';
import { UpdateSellerDto } from '../dto/update-seller.dto';
import { ISellerService } from '../services/sellers.service.interface';
import { SELLERS_SERVICE } from '../../common/tokens';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Roles } from '../../auth/rbac/roles.decorator';
import { Role } from '../../auth/rbac/role.enum';
import { Public } from '../../auth/guards/public-auth.decorator';

@ApiTags('sellers')
@ApiBearerAuth()
@Controller('sellers')
export class SellersController {
  constructor(
    @Inject(SELLERS_SERVICE)
    private readonly sellersService: ISellerService,
  ) {}

  @Post()
  @Roles(Role.Admin, Role.Seller)
  @ApiOperation({ summary: 'Create a new seller profile' })
  @ApiResponse({ status: 201, description: 'Seller created successfully' })
  create(@Body() dto: CreateSellerDto, @Request() req: any) {
    const userId = req.user?.sub || 'system';
    return this.sellersService.create(dto, userId);
  }

  @Get()
  @Public()
  @ApiOperation({ summary: 'Get all sellers' })
  @ApiResponse({ status: 200, description: 'List of all sellers' })
  findAll() {
    return this.sellersService.findAll();
  }

  @Get('by-user/:userId')
  @Public()
  @ApiOperation({ summary: 'Get seller by user ID' })
  @ApiResponse({ status: 200, description: 'Seller found' })
  @ApiResponse({ status: 404, description: 'Seller not found' })
  findByUserId(@Param('userId', ParseUUIDPipe) userId: string) {
    return this.sellersService.findByUserId(userId);
  }

  @Get(':id')
  @Public()
  @ApiOperation({ summary: 'Get a seller by id' })
  @ApiResponse({ status: 200, description: 'Seller found' })
  @ApiResponse({ status: 404, description: 'Seller not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.sellersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Admin, Role.Seller)
  @ApiOperation({ summary: 'Update a seller profile' })
  @ApiResponse({ status: 200, description: 'Seller updated successfully' })
  @ApiResponse({ status: 404, description: 'Seller not found' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateSellerDto, @Request() req: any) {
    const userId = req.user?.sub || 'system';
    return this.sellersService.update(id, dto, userId);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  @ApiOperation({ summary: 'Delete a seller profile (soft delete)' })
  @ApiResponse({ status: 200, description: 'Seller deleted successfully' })
  @ApiResponse({ status: 404, description: 'Seller not found' })
  async remove(@Param('id', ParseUUIDPipe) id: string) {
    await this.sellersService.remove(id);
    return { message: `Seller ${id} removed successfully` };
  }
}

