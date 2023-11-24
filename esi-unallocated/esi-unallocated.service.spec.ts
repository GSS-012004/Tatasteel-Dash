import { TestBed } from '@angular/core/testing';

import { EsiUnallocatedService } from './esi-unallocated.service';

describe('EsiUnallocatedService', () => {
  let service: EsiUnallocatedService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(EsiUnallocatedService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
