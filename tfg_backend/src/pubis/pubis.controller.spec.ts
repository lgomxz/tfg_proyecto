import { Test, TestingModule } from '@nestjs/testing';
import { PubisController } from './pubis.controller';

describe('PubisController', () => {
  let controller: PubisController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PubisController],
    }).compile();

    controller = module.get<PubisController>(PubisController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
