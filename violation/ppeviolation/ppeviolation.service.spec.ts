import { TestBed } from '@angular/core/testing';

import { PpeviolationService } from './ppeviolation.service';

describe('PpeviolationService', () => {
  let service: PpeviolationService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PpeviolationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
