import {Injectable, NotFoundException} from '@nestjs/common';
import {InjectRepository} from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import {User} from '../entities/user.entity';
import {CreateUserDto} from '../dto/create-user.dto';
import {UpdateUserDto} from '../dto/update-user.dto';
import {IUserRepository} from './users.repository.interface';

@Injectable()
export class UsersRepository implements IUserRepository {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {
  }

  async findOneByUsername(username: string): Promise<User|null> {
    return await this.repo.findOneBy({username: username});
  }

  async create(dto: CreateUserDto): Promise<User> {
    const user = this.repo.create(dto);
    user.createdBy = 'origin';
    user.lastChangedBy = 'origin';
    return this.repo.save(user);
  }

  async findAll(): Promise<User[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<User> {
    const user = await this.repo.findOneBy({id});
    if (!user) throw new NotFoundException(`User ${id} not found`);
    return user;
  }


  async update(id: string, dto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    Object.assign(user, dto);
    return this.repo.save(user);
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.repo.remove(user);
  }
}
