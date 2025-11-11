import { TestBed } from '@angular/core/testing';

import { RolesApiService } from './roles-api.service';

describe('RolesApiService', () => {
  let service: RolesApiService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RolesApiService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
