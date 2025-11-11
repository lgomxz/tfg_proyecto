import { Test, TestingModule } from '@nestjs/testing';
import { PubisLabelController } from './pubis-label.controller';

describe('PubisLabelController', () => {
  let controller: PubisLabelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PubisLabelController],
    }).compile();

    controller = module.get<PubisLabelController>(PubisLabelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
