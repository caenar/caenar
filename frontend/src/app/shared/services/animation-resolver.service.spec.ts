import { TestBed } from '@angular/core/testing';

import { AnimationResolverService } from './animation-resolver.service';

describe('AnimationResolverService', () => {
  let service: AnimationResolverService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AnimationResolverService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
