import { TestBed } from '@angular/core/testing';

import { CensustractService } from './censustract.service';

describe('CensustractService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CensustractService = TestBed.get(CensustractService);
    expect(service).toBeTruthy();
  });
});
