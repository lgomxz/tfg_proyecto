import { Test, TestingModule } from '@nestjs/testing';
import { PubisService } from './pubis.service';

describe('PubisService', () => {
  let service: PubisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PubisService],
    }).compile();

    service = module.get<PubisService>(PubisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
