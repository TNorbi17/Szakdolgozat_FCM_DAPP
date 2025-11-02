import { TestBed } from '@angular/core/testing';

import { Web3InitService } from './web3-init.service';

describe('Web3InitService', () => {
  let service: Web3InitService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Web3InitService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
