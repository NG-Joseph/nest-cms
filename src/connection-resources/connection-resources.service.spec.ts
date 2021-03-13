import { Test, TestingModule } from '@nestjs/testing';
import { ConnectionResourcesService } from './connection-resources.service';

describe('ConnectionResourcesService', () => {
  let service: ConnectionResourcesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ConnectionResourcesService],
    }).compile();

    service = module.get<ConnectionResourcesService>(ConnectionResourcesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
