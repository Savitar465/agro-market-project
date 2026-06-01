import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  Param,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UpdateUserRolesDto } from '../dto/update-user-roles.dto';
import { IUsersService } from '../services/users.service.interface';
import { USERS_SERVICE } from '../../common/tokens';
import { Role } from '../../auth/rbac/role.enum';
import { Roles } from '../../auth/rbac/roles.decorator';

/** Shape of the JWT payload attached to the request by AuthGuard. */
type JwtUser = { sub: string; username: string; roles: Role[] };

@Controller('users')
export class UsersController {
  constructor(
    @Inject(USERS_SERVICE) private readonly usersService: IUsersService,
  ) {}

  // Public self-registration goes through POST /auth/register (consumidor /
  // productor only). This admin-only endpoint can create users with any role.
  @Post()
  @Roles(Role.Admin)
  async create(@Body() dto: CreateUserDto) {
    return this.usersService.create(dto);
  }

  @Get()
  @Roles(Role.Admin)
  findAll() {
    return this.usersService.findAll();
  }

  // Profile of the authenticated user (consumidor / productor / administrador).
  // Declared before ':id' so it is not captured by the param route.
  @Get('me')
  me(@Req() req: Request) {
    const { sub } = (req as Request & { user: JwtUser }).user;
    return this.usersService.findOne(sub);
  }

  @Get(':id')
  @Roles(Role.Admin)
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @Roles(Role.Admin)
  update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    return this.usersService.update(id, dto);
  }

  // Asociar tipo de usuario — replace the user's role set.
  @Patch(':id/roles')
  @Roles(Role.Admin)
  setRoles(@Param('id') id: string, @Body() dto: UpdateUserRolesDto) {
    return this.usersService.setRoles(id, dto.roles);
  }

  // Suspender usuario.
  @Patch(':id/suspend')
  @Roles(Role.Admin)
  suspend(@Param('id') id: string) {
    return this.usersService.setActive(id, false);
  }

  // Reactivar usuario.
  @Patch(':id/reactivate')
  @Roles(Role.Admin)
  reactivate(@Param('id') id: string) {
    return this.usersService.setActive(id, true);
  }

  @Delete(':id')
  @Roles(Role.Admin)
  remove(@Param('id') id: string) {
    this.usersService.remove(id);
    return { message: `User ${id} removed` };
  }
}
