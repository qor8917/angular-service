import { TestBed } from '@angular/core/testing';

import { InMemortDataService } from './in-memory-data.service';

describe('InMemortDataService', () => {
  let service: InMemortDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InMemortDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
