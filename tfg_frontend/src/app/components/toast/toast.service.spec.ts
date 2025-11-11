import { TestBed } from '@angular/core/testing';

import { CcbToastService } from './toast.service';

describe('ToastService', () => {
  let service: CcbToastService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CcbToastService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
