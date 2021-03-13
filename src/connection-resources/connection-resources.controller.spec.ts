import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionResourcesController } from './connection-resources.controller';

describe('ConnectionResourcesController', () => {
  let controller: ConnectionResourcesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ConnectionResourcesController],
    }).compile();

    controller = module.get<ConnectionResourcesController>(ConnectionResourcesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
