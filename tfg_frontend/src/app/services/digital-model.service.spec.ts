import { TestBed } from '@angular/core/testing';

import { DigitalModelService } from './digital-model.service';

describe('DigitalModelService', () => {
  let service: DigitalModelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DigitalModelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
