import { Test, TestingModule } from '@nestjs/testing';
import { UserCollectionsController } from './user_collections.controller';

describe('UserCollectionsController', () => {
  let controller: UserCollectionsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserCollectionsController],
    }).compile();

    controller = module.get<UserCollectionsController>(UserCollectionsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
