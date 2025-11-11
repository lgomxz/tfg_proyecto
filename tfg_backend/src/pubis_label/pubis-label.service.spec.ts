import { Test, TestingModule } from '@nestjs/testing';
import { PubisLabelService } from './pubis-label.service';

describe('PubisLabelService', () => {
  let service: PubisLabelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PubisLabelService],
    }).compile();

    service = module.get<PubisLabelService>(PubisLabelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
