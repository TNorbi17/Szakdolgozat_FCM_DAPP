import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlayerTransferoffersComponent } from './player-transferoffers.component';

describe('PlayerTransferoffersComponent', () => {
  let component: PlayerTransferoffersComponent;
  let fixture: ComponentFixture<PlayerTransferoffersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PlayerTransferoffersComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PlayerTransferoffersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
