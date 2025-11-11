import { Test, TestingModule } from '@nestjs/testing';
import { CollectionPubisService } from './pubis-collection.service';

describe('CollectionPubisService', () => {
  let service: CollectionPubisService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CollectionPubisService],
    }).compile();

    service = module.get<CollectionPubisService>(CollectionPubisService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
