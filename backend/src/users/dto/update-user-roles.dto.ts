import { ArrayNotEmpty, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../auth/rbac/role.enum';

/**
 * Asociar tipo de usuario — replaces the user's role set.
 * Admin-only (see UsersController).
 */
export class UpdateUserRolesDto {
  @ApiProperty({ enum: Role, isArray: true })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Role, { each: true })
  roles: Role[];
}
