import { TestBed } from '@angular/core/testing';

import { ComputeStyleService } from './compute-style.service';

describe('ComputeStyleService', () => {
  let service: ComputeStyleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ComputeStyleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
