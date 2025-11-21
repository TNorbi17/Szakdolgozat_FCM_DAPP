import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { LoginComponent } from './login.component';
import { NO_ERRORS_SCHEMA } from '@angular/core';

describe('LoginComponent (egyszerű unit teszt)', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {

    await TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [ReactiveFormsModule, FormsModule],
      providers: [
      ],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('a komponenst sikeresen létre kell hozni', () => {
    expect(component).toBeTruthy();
  });

  it('inicializáláskor létrejön a form két mezővel (walletAddress, password)', () => {
    const form = component.loginForm;
    expect(form.contains('walletAddress')).toBeTrue();
    expect(form.contains('password')).toBeTrue();
  });

  it('a loginForm érvénytelen, ha üres', () => {
    component.loginForm.reset();
    expect(component.loginForm.valid).toBeFalse();
  });

  it('a loginForm érvényes, ha minden mező kitöltve van', () => {
    component.loginForm.setValue({
      walletAddress: '0x123',
      password: 'teszt123',
    });
    expect(component.loginForm.valid).toBeTrue();
  });

  it('onLogin() hibát ad, ha az űrlap érvénytelen', async () => {
    component.loginForm.reset();
    await component.onLogin();
    expect(component.errorMessage).toContain('Kérjük, adja meg');
  });

 

 
});