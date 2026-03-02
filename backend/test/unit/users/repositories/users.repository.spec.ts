import { UsersRepository } from '../../../../src/users/repositories/users.repository';
import { NotFoundException } from '@nestjs/common';

describe('UsersRepository', () => {
  let repo: UsersRepository;

  beforeEach(() => {
    repo = new UsersRepository();
  });

  it('should create and retrieve users', () => {
    const created = repo.create({ name: 'John', email: 'john@mail.com' });
    expect(created.id).toBeGreaterThan(0);
    const all = repo.findAll();
    expect(all).toHaveLength(1);
    expect(repo.findOne(created.id)).toEqual(created);
  });

  it('should update existing user', () => {
    const created = repo.create({ name: 'John', email: 'john@mail.com' });
    const updated = repo.update(created.id, { name: 'Johnny' });
    expect(updated.name).toBe('Johnny');
    expect(repo.findOne(created.id).name).toBe('Johnny');
  });

  it('should remove user and throw when not found', () => {
    const created = repo.create({ name: 'John', email: 'john@mail.com' });
    repo.remove(created.id);
    expect(() => repo.findOne(created.id)).toThrow(NotFoundException);
    expect(() => repo.remove(999)).toThrow(NotFoundException);
  });
});
