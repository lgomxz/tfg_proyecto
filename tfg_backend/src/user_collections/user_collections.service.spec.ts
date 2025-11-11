import { Test, TestingModule } from '@nestjs/testing';
import { UserCollectionsService } from './user_collections.service';

describe('UserCollectionsService', () => {
  let service: UserCollectionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserCollectionsService],
    }).compile();

    service = module.get<UserCollectionsService>(UserCollectionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
