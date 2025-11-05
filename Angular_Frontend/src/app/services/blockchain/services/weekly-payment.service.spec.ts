import { TestBed } from '@angular/core/testing';

import { WeeklyPaymentService} from './weekly-payment.service';

describe('WeeklyPaymentService', () => {
  let service: WeeklyPaymentService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WeeklyPaymentService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
