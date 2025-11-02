import { TestBed } from '@angular/core/testing';

import { DailyPaymentService } from './daily-payment.service';

describe('DailyPaymentService', () => {
  let service: DailyPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DailyPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
