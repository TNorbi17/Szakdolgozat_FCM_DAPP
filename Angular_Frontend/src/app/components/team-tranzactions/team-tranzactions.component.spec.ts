import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TeamTranzactionsComponent } from './team-tranzactions.component';

describe('TeamTranzactionsComponent', () => {
  let component: TeamTranzactionsComponent;
  let fixture: ComponentFixture<TeamTranzactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TeamTranzactionsComponent], imports: [FormsModule,ReactiveFormsModule]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TeamTranzactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
