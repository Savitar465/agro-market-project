import { ConflictException, Inject, Injectable, Logger } from '@nestjs/common';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { User } from '../entities/user.entity';

import { USERS_REPOSITORY } from '../../common/tokens';
import { IUserRepository } from '../repositories/users.repository.interface';
import { IUsersService, SafeUser } from './users.service.interface';
import { Role } from '../../auth/rbac/role.enum';
import * as bcrypt from 'bcrypt';
@Injectable()
export class UsersService implements IUsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    @Inject(USERS_REPOSITORY)
    private readonly repo: IUserRepository,
  ) {}

  /** Drops the password hash so it never leaves the service layer. */
  private toSafe(user: User): SafeUser {
    const { password, ...safe } = user;
    return safe;
  }

  async findOneByUsername(username: string): Promise<User | null> {
    this.logger.debug(`findOneByUsername called for username=${username}`);
    try {
      const user = await this.repo.findOneByUsername(username);
      this.logger.debug(
        `findOneByUsername result for username=${username} -> ${user ? 'found' : 'not found'}`,
      );
      return user;
    } catch (err) {
      this.logger.error(
        `Error in findOneByUsername for username=${username}`,
        err as any,
      );
      throw err;
    }
  }

  async create(dto: CreateUserDto): Promise<SafeUser> {
    this.logger.log(`create called for username=${dto.username}`);
    try {
      const user = await this.findOneByUsername(dto.username);
      if (user) {
        this.logger.warn(
          `create aborted: user already exists username=${dto.username}`,
        );
        throw new ConflictException('User already exists');
      }
      // don't log plaintext password
      dto.password = await bcrypt.hash(dto.password, await bcrypt.genSalt());
      const created = await this.repo.create(dto);
      this.logger.log(
        `user created id=${created.id} username=${created.username}`,
      );
      return this.toSafe(created);
    } catch (err) {
      this.logger.error(
        `Error creating user username=${dto.username}`,
        err as any,
      );
      throw err;
    }
  }

  async findAll(): Promise<SafeUser[]> {
    this.logger.debug('findAll called');
    try {
      const all = await this.repo.findAll();
      this.logger.debug(`findAll returned ${all.length} users`);
      return all.map((u) => this.toSafe(u));
    } catch (err) {
      this.logger.error('Error in findAll', err as any);
      throw err;
    }
  }

  async findOne(id: string): Promise<SafeUser> {
    this.logger.debug(`findOne called id=${id}`);
    try {
      const u = await this.repo.findOne(id);
      this.logger.debug(
        `findOne result id=${id} -> ${u ? 'found' : 'not found'}`,
      );
      return this.toSafe(u);
    } catch (err) {
      this.logger.error(`Error in findOne id=${id}`, err as any);
      throw err;
    }
  }

  async update(id: string, dto: UpdateUserDto): Promise<SafeUser> {
    this.logger.log(`update called id=${id}`);
    try {
      const updated = await this.repo.update(id, dto);
      this.logger.log(`update successful id=${id}`);
      return this.toSafe(updated);
    } catch (err) {
      this.logger.error(`Error updating user id=${id}`, err as any);
      throw err;
    }
  }

  async setRoles(id: string, roles: Role[]): Promise<SafeUser> {
    this.logger.log(`setRoles called id=${id} roles=${roles.join(',')}`);
    try {
      const updated = await this.repo.setRoles(id, roles);
      this.logger.log(`setRoles successful id=${id}`);
      return this.toSafe(updated);
    } catch (err) {
      this.logger.error(`Error setting roles for user id=${id}`, err as any);
      throw err;
    }
  }

  async setActive(id: string, isActive: boolean): Promise<SafeUser> {
    this.logger.log(`setActive called id=${id} isActive=${isActive}`);
    try {
      const updated = await this.repo.setActive(id, isActive);
      this.logger.log(`setActive successful id=${id}`);
      return this.toSafe(updated);
    } catch (err) {
      this.logger.error(`Error setting active for user id=${id}`, err as any);
      throw err;
    }
  }

  async remove(id: string): Promise<void> {
    this.logger.log(`remove called id=${id}`);
    try {
      await this.repo.remove(id);
      this.logger.log(`remove successful id=${id}`);
    } catch (err) {
      this.logger.error(`Error removing user id=${id}`, err as any);
      throw err;
    }
  }
}
