import {IsAlpha, IsAlphanumeric, IsEmail, IsNotEmpty, IsStrongPassword} from 'class-validator';
import {ApiProperty} from "@nestjs/swagger";
import {Role} from "../../auth/rbac/role.enum";

export class CreateUserDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsAlpha()
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
  @IsStrongPassword( {
    minLength: 8,
    minLowercase: 1,
    minNumbers: 1,
    minSymbols: 1,
    minUppercase: 1,
  })
  password: string;
  @ApiProperty()
  @IsNotEmpty()
  roles: Role[];
}
