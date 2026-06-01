import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';
import { Role } from '../../auth/rbac/role.enum';

/** A user safe to expose over the API — never carries the password hash. */
export type SafeUser = Omit<User, 'password'>;

export interface IUsersService {
  create(dto: CreateUserDto): Promise<SafeUser>;
  findAll(): Promise<SafeUser[]>;
  findOne(id: string): Promise<SafeUser>;
  findOneByUsername(username: string): Promise<User | null>;
  update(id: string, dto: UpdateUserDto): Promise<SafeUser>;
  setRoles(id: string, roles: Role[]): Promise<SafeUser>;
  setActive(id: string, isActive: boolean): Promise<SafeUser>;
  remove(id: string): Promise<void>;
}
