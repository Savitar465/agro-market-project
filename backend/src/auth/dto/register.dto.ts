import { ApiProperty } from '@nestjs/swagger';
import {
  IsAlphanumeric,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsStrongPassword,
  MaxLength,
} from 'class-validator';
import { Role } from '../rbac/role.enum';

/**
 * Roles a user is allowed to self-assign during public registration.
 * Administrador (Role.Admin) is intentionally excluded — admins are created
 * only by other admins via POST /users.
 */
export const SELF_ASSIGNABLE_ROLES = [Role.User, Role.Seller] as const;

export class RegisterDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MaxLength(200)
  name: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsAlphanumeric()
  username: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;

  @ApiProperty({
    enum: SELF_ASSIGNABLE_ROLES,
    default: Role.User,
    description: 'consumidor (user) or productor (seller)',
  })
  @IsOptional()
  @IsIn(SELF_ASSIGNABLE_ROLES)
  role?: Role;
}
