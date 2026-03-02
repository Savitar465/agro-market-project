import { Test } from '@nestjs/testing';
import { UsersController } from '../../../../src/users/controller/users.controller';
import { USERS_SERVICE } from '../../../../src/common/tokens';
import { IUsersService } from '../../../../src/users/services/users.service.interface';

describe('UsersController', () => {
  let controller: UsersController;
  let service: jest.Mocked<IUsersService>;

  beforeEach(async () => {
    service = {
      create: jest.fn(),
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    } as any;

    const moduleRef = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: USERS_SERVICE, useValue: service },
      ],
    }).compile();

    controller = moduleRef.get(UsersController);
  });

  it('should delegate create', () => {
    const dto = { name: 'John' } as any;
    const created = { id: 1, ...dto } as any;
    service.create.mockReturnValue(created);

    const result = controller.create(dto);

    expect(service.create).toHaveBeenCalledWith(dto);
    expect(result).toEqual(created);
  });

  it('should delegate findAll', () => {
    const list = [{ id: 1 }, { id: 2 }] as any;
    service.findAll.mockReturnValue(list);

    expect(controller.findAll()).toBe(list);
    expect(service.findAll).toHaveBeenCalled();
  });

  it('should delegate findOne', () => {
    const user = { id: 5 } as any;
    service.findOne.mockReturnValue(user);

    expect(controller.findOne(5)).toBe(user);
    expect(service.findOne).toHaveBeenCalledWith(5);
  });

  it('should delegate update', () => {
    const updated = { id: 2, name: 'X' } as any;
    service.update.mockReturnValue(updated);

    const dto = { name: 'X' } as any;
    expect(controller.update(2, dto)).toBe(updated);
    expect(service.update).toHaveBeenCalledWith(2, dto);
  });

  it('should call remove and return message', () => {
    const resp = controller.remove(9);
    expect(service.remove).toHaveBeenCalledWith(9);
    expect(resp).toEqual({ message: 'User 9 removed' });
  });
});
