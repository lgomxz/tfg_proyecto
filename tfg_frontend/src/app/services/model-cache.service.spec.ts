import { TestBed } from '@angular/core/testing';

import { ModelCacheService } from './model-cache.service';

describe('ModelCacheService', () => {
  let service: ModelCacheService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModelCacheService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
