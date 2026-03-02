import {Body, Controller, Delete, Get, Inject, Param, Patch, Post} from '@nestjs/common';
import {CreateUserDto} from '../dto/create-user.dto';
import {UpdateUserDto} from '../dto/update-user.dto';
import {IUsersService} from '../services/users.service.interface';
import {USERS_SERVICE} from '../../common/tokens';
import {Role} from "../../auth/rbac/role.enum";
import {Roles} from "../../auth/rbac/roles.decorator";
import { Public } from "src/auth/guards/public-auth.decorator";

@Controller('users')
export class UsersController {
  constructor(@Inject(USERS_SERVICE) private readonly usersService: IUsersService) {
  }

  @Post()
  @Public()
  // @Roles(Role.Admin)
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @Roles(Role.Admin)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    this.usersService.remove(id);
    return {message: `User ${id} removed`};
  }
}
