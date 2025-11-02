import { TestBed } from '@angular/core/testing';

import { Web3Init } from './web3-init';

describe('Web3Init', () => {
  let service: Web3Init;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(Web3Init);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
