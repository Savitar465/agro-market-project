import { Test } from '@nestjs/testing';
import { CART_REPOSITORY } from '../../../../src/common/tokens';
import { CartService } from '../../../../src/cart/services/cart.service';
import { ICartRepository } from '../../../../src/cart/repositories/cart.repository.interface';

describe('CartService', () => {
  let service: CartService;
  let repo: jest.Mocked<ICartRepository>;

  beforeEach(async () => {
    repo = {
      getOpenCart: jest.fn(),
      addItem: jest.fn(),
      updateItem: jest.fn(),
      removeItem: jest.fn(),
      clear: jest.fn(),
      checkout: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        CartService,
        { provide: CART_REPOSITORY, useValue: repo },
      ],
    }).compile();

    service = moduleRef.get(CartService);
  });

  it('delegates getOpenCart to repository', async () => {
    repo.getOpenCart.mockResolvedValue({ id: 'cart-1' } as any);

    const result = await service.getOpenCart('user-1');

    expect(repo.getOpenCart).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ id: 'cart-1' });
  });

  it('delegates checkout to repository', async () => {
    repo.checkout.mockResolvedValue({ id: 'cart-1', status: 'PURCHASED' } as any);

    const result = await service.checkout('user-1');

    expect(repo.checkout).toHaveBeenCalledWith('user-1');
    expect(result).toEqual({ id: 'cart-1', status: 'PURCHASED' });
  });
});

