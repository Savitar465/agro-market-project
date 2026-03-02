import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

export interface IUserRepository {
  create(dto: CreateUserDto): Promise<User>;
  findAll(): Promise<User[]>;
  findOne(id: string): Promise<User>;
  findOneByUsername(username: string): Promise<User|null>;
  update(id: string, dto: UpdateUserDto): Promise<User>;
  remove(id: string): Promise<void>;
}
