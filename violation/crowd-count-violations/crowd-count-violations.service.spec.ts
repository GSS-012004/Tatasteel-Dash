import { TestBed } from '@angular/core/testing';

import { CrowdCountViolationsService } from './crowd-count-violations.service';

describe('CrowdCountViolationsService', () => {
  let service: CrowdCountViolationsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrowdCountViolationsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
