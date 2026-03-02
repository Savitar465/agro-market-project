import { Test } from '@nestjs/testing';
import { ProductsService } from '../../../../src/products/services/products.service';
import { PRODUCTS_REPOSITORY } from '../../../../src/common/tokens';
import { IProductRepository } from '../../../../src/products/repositories/products.repository.interface';
import { NotFoundException } from '@nestjs/common';

describe('ProductsService', () => {
  let service: ProductsService;
  let repo: jest.Mocked<IProductRepository>;

  beforeEach(async () => {
    repo = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    const moduleRef = await Test.createTestingModule({
      providers: [
        ProductsService,
        { provide: PRODUCTS_REPOSITORY, useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(ProductsService);
  });

  it('should create product', () => {
    const dto = { name: 'Apple', price: 3 } as any;
    repo.create.mockReturnValue({ id: 1, ...dto } as any);

    const result = service.create(dto);

    expect(repo.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ id: 1, ...dto });
  });

  it('should list products', () => {
    const products = [
      { id: 1, name: 'A', price: 3 },
      { id: 2, name: 'B', price: 5 },
    ] as any;
    repo.findAll.mockReturnValue(products);

    expect(service.findAll()).toBe(products);
  });

  it('should get one product', () => {
    const product = { id: 1, name: 'A', price: 3 } as any;
    repo.findOne.mockReturnValue(product);
    expect(service.findOne(1)).toBe(product);
    expect(repo.findOne).toHaveBeenCalledWith(1);
  });

  it('should update product', () => {
    const updated = { id: 1, name: 'AA', price: 4 } as any;
    repo.update.mockReturnValue(updated);
    expect(service.update(1, { name: 'AA' } as any)).toBe(updated);
    expect(repo.update).toHaveBeenCalledWith(1, { name: 'AA' });
  });

  it('should remove product and propagate errors', () => {
    repo.remove.mockImplementation(() => { throw new NotFoundException(); });
    expect(() => service.remove(99)).toThrow(NotFoundException);
  });
});
