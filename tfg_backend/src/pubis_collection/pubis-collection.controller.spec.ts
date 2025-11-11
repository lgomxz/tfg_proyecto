import { Test, TestingModule } from '@nestjs/testing';
import { CollectionPubisController } from './pubis-collection.controller';

describe('CollectionPubisController', () => {
  let controller: CollectionPubisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CollectionPubisController],
    }).compile();

    controller = module.get<CollectionPubisController>(
      CollectionPubisController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
