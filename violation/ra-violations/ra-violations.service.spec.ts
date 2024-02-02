import { TestBed } from '@angular/core/testing';

import { RaViolationsService } from './ra-violations.service';

describe('RaViolationsService', () => {
  let service: RaViolationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RaViolationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
