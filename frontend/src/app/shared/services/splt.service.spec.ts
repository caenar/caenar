import { TestBed } from '@angular/core/testing';

import { SpltService } from './splt.service';

describe('SpltService', () => {
  let service: SpltService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SpltService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
