import { TestBed } from '@angular/core/testing';

import { PwdhashService } from './pwdhash.service';

describe('PwdhashService', () => {
  let service: PwdhashService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PwdhashService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
