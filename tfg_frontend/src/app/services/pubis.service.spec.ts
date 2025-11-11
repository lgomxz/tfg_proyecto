import { TestBed } from '@angular/core/testing';

import { PubisService } from './pubis.service';

describe('PubisService', () => {
  let service: PubisService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PubisService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
