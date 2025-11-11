import { TestBed } from '@angular/core/testing';

import { UserCollectionsService } from './user-collections.service';

describe('UserCollectionsService', () => {
  let service: UserCollectionsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(UserCollectionsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
