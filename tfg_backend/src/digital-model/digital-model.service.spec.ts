import { Test, TestingModule } from '@nestjs/testing';
import { DigitalModelService } from './digital-model.service';

describe('DigitalModelService', () => {
  let service: DigitalModelService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DigitalModelService],
    }).compile();

    service = module.get<DigitalModelService>(DigitalModelService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
