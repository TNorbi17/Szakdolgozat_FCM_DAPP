import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { RegisterComponent } from './register.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('RegisterComponent (egyszerű unit teszt)', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [ReactiveFormsModule, FormsModule],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('a komponenst sikeresen létre kell hozni', () => {
    expect(component).toBeTruthy();
  });

  it('az alapértelmezett userType "player" legyen', () => {
    expect(component.userType).toBe('player');
  });

  it('a form érvénytelen ha üres', () => {
    expect(component.registrationForm.valid).toBeFalse();
  });

  it('ha minden érték helyes, a form érvényes legyen', () => {
    component.registrationForm.setValue({
      userType: 'player',
      email: 'teszt@test.hu',
      password: 'asd123',
      confirmPassword: 'asd123',
      playerName: 'Norbi',
      position: 2,
      dateOfBirth: '1995-05-10',
      walletAddress: '0x123',
      teamName: null,
      foundationYear: null
    });
    expect(component.registrationForm.valid).toBeTrue();
  });

  it('ha a jelszavak nem egyeznek, a form legyen érvénytelen', () => {
    component.registrationForm.patchValue({
      password: 'asd123',
      confirmPassword: 'másik123',
    });
    expect(component.registrationForm.valid).toBeFalse();
  });

  it('onSubmit hívásakor beáll részletes hibát, ha a form érvénytelen', () => {
    component.registrationForm.reset();
    component.onSubmit();
    expect(component.errorMessage.toLowerCase()).toContain('űrlap');
  });
});