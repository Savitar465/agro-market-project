import { ProductsRepository } from '../../../../src/products/repositories/products.repository';
import { NotFoundException } from '@nestjs/common';

describe('ProductsRepository', () => {
  let repo: ProductsRepository;

  beforeEach(() => {
    repo = new ProductsRepository();
  });

  it('should create and retrieve products', () => {
    const created = repo.create({ name: 'Apple', price: 3 });
    expect(created.id).toBeGreaterThan(0);
    const all = repo.findAll();
    expect(all).toHaveLength(1);
    expect(repo.findOne(created.id)).toEqual(created);
  });

  it('should update existing product', () => {
    const created = repo.create({ name: 'Apple', price: 3 });
    const updated = repo.update(created.id, { name: 'Green Apple' });
    expect(updated.name).toBe('Green Apple');
    expect(repo.findOne(created.id).name).toBe('Green Apple');
  });

  it('should remove product and throw when not found', () => {
    const created = repo.create({ name: 'Apple', price: 3 });
    repo.remove(created.id);
    expect(() => repo.findOne(created.id)).toThrow(NotFoundException);
    expect(() => repo.remove(999)).toThrow(NotFoundException);
  });
});
