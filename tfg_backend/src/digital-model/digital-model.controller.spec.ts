import { Test, TestingModule } from '@nestjs/testing';
import { DigitalModelController } from './digital-model.controller';

describe('DigitalModelController', () => {
  let controller: DigitalModelController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DigitalModelController],
    }).compile();

    controller = module.get<DigitalModelController>(DigitalModelController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
