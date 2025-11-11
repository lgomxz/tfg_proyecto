import { TestBed } from '@angular/core/testing';

import { LabellingService } from './labelling.service';

describe('LabellingService', () => {
  let service: LabellingService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(LabellingService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
