import { TestBed } from '@angular/core/testing';

import { ContractLoaderService } from './contract-loader.service';

describe('ContractLoaderService', () => {
  let service: ContractLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContractLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
