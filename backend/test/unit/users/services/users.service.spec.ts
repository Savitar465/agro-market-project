import { Test } from '@nestjs/testing';
import { UsersService } from '../../../../src/users/services/users.service';
import { USERS_REPOSITORY } from '../../../../src/common/tokens';
import { IUserRepository } from '../../../../src/users/repositories/users.repository.interface';
import { NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repo: jest.Mocked<IUserRepository>;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: USERS_REPOSITORY, useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(UsersService);
  });

  it('should create user', () => {
    const dto = { name: 'John', email: 'john@example.com', password: '123' };
    repo.create.mockReturnValue({ id: '1', ...dto });

    const result = service.create(dto);

    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('should list users', () => {
    const users = [
      { id: 1, name: 'A', email: 'a@mail.com' },
      { id: 2, name: 'B', email: 'b@mail.com' },
    ];
    repo.findAll.mockReturnValue(users);

    expect(service.findAll()).toBe(users);
  });

  it('should get one user', () => {
    const user = { id: 1, name: 'A', email: 'a@mail.com' };
    repo.findOne.mockReturnValue(user);
    expect(service.findOne(1)).toBe(user);
    expect(repo.findOne).toHaveBeenCalledWith(1);
  });

  it('should update user', () => {
    const updated = { id: 1, name: 'AA', email: 'a@mail.com' };
    repo.update.mockReturnValue(updated);
    expect(service.update(1, { name: 'AA' })).toBe(updated);
    expect(repo.update).toHaveBeenCalledWith(1, { name: 'AA' });
  });

  it('should remove user and propagate errors', () => {
    repo.remove.mockImplementation(() => { throw new NotFoundException(); });
    expect(() => service.remove(99)).toThrow(NotFoundException);
  });
});
