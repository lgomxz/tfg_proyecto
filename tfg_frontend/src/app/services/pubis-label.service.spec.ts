import { TestBed } from '@angular/core/testing';

import { PubisLabelService } from './pubis-label.service';

describe('PubisLabelService', () => {
  let service: PubisLabelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PubisLabelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
