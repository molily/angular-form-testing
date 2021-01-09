import { NO_ERRORS_SCHEMA } from '@angular/compiler';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { PasswordStrength, SignupService } from 'src/app/services/signup.service';
import {
  expectText,
  findEl,
  setFieldValue,
} from 'src/app/spec-helpers/element.spec-helper';
import {
  addressLine1,
  addressLine2,
  city,
  country,
  email,
  name,
  password,
  postcode,
  region,
  signupData,
  username,
} from 'src/app/spec-helpers/signup-data.spec-helper';

import { FieldErrorsComponent } from '../field-errors/field-errors.component';
import { SignupFormComponent } from './signup-form.component';

const requiredFields = [
  'username',
  'email',
  'name',
  'addressLine2',
  'city',
  'postcode',
  'country',
];

const weakPassword: PasswordStrength = {
  score: 2,
  warning: 'too short',
  suggestions: ['try a longer password'],
};

const strongPassword: PasswordStrength = {
  score: 4,
  warning: '',
  suggestions: [],
};

describe('SignupFormComponent', () => {
  let component: SignupFormComponent;
  let fixture: ComponentFixture<SignupFormComponent>;
  let signupService: jasmine.SpyObj<SignupService>;

  const setup = async () => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [SignupFormComponent, FieldErrorsComponent],
      providers: [{ provide: SignupService, useValue: signupService }],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();

    fixture = TestBed.createComponent(SignupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  };

  const fillForm = () => {
    setFieldValue(fixture, 'username', username);
    setFieldValue(fixture, 'email', email);
    setFieldValue(fixture, 'password', password);
    setFieldValue(fixture, 'name', name);
    setFieldValue(fixture, 'addressLine1', addressLine1);
    setFieldValue(fixture, 'addressLine2', addressLine2);
    setFieldValue(fixture, 'city', city);
    setFieldValue(fixture, 'postcode', postcode);
    setFieldValue(fixture, 'region', region);
    setFieldValue(fixture, 'country', country);
  };

  describe('success case', () => {
    beforeEach(async () => {
      signupService = jasmine.createSpyObj<SignupService>('SignupService', {
        isUsernameTaken: of(false),
        getPasswordStrength: of(strongPassword),
        signup: of({ success: true }),
      });
      await setup();
    });

    it('submits the form successfully', fakeAsync(() => {
      fillForm();

      expect(findEl(fixture, 'submit').properties.disabled).toBe(true);
      // Wait for async validators
      tick(1000);
      fixture.detectChanges();
      expect(findEl(fixture, 'submit').properties.disabled).toBe(false);
      findEl(fixture, 'form').triggerEventHandler('submit', {});
      fixture.detectChanges();
      expectText(fixture, 'status', 'Sign-up successful');

      expect(signupService.isUsernameTaken).toHaveBeenCalledWith(username);
      expect(signupService.getPasswordStrength).toHaveBeenCalledWith(password);
      expect(signupService.signup).toHaveBeenCalledWith(signupData);
    }));
  });

  describe('error case', () => {
    it('fails if the username is taken', fakeAsync(async () => {
      signupService = jasmine.createSpyObj<SignupService>('SignupService', {
        // Let the API return that the username is taken
        isUsernameTaken: of(true),
        getPasswordStrength: of(strongPassword),
        signup: of({ success: true }),
      });
      await setup();

      fillForm();

      // Wait for async validators
      tick(1000);
      fixture.detectChanges();
      expect(findEl(fixture, 'submit').properties.disabled).toBe(true);

      expect(signupService.isUsernameTaken).toHaveBeenCalledWith(username);
      expect(signupService.getPasswordStrength).toHaveBeenCalledWith(password);
      expect(signupService.signup).not.toHaveBeenCalled();
    }));

    it('fails if the password is too weak', fakeAsync(async () => {
      signupService = jasmine.createSpyObj<SignupService>('SignupService', {
        isUsernameTaken: of(false),
        // Let the API return that the password is weak
        getPasswordStrength: of(weakPassword),
        signup: of({ success: true }),
      });
      await setup();

      fillForm();

      // Wait for async validators
      tick(1000);
      fixture.detectChanges();
      expect(findEl(fixture, 'submit').properties.disabled).toBe(true);

      expect(signupService.isUsernameTaken).toHaveBeenCalledWith(username);
      expect(signupService.getPasswordStrength).toHaveBeenCalledWith(password);
      expect(signupService.signup).not.toHaveBeenCalled();
    }));

    it('marks fields as required', async () => {
      signupService = jasmine.createSpyObj<SignupService>('SignupService', {
        isUsernameTaken: of(false),
        getPasswordStrength: of(strongPassword),
        signup: of({ success: true }),
      });
      await setup();

      // Mark required form fields as touched.
      requiredFields.forEach((testId) => {
        const debugElement = findEl(fixture, testId);
        // Dispatch a synthetic blur event.
        (debugElement.nativeElement as HTMLElement).dispatchEvent(new FocusEvent('blur'));
      });

      fixture.detectChanges();

      requiredFields.forEach((testId) => {
        expect(findEl(fixture, testId).classes['ng-invalid']).toBe(
          true,
          `${testId} must be required`,
        );
      });
    });

    it('handles signup failure', fakeAsync(async () => {
      signupService = jasmine.createSpyObj<SignupService>('SignupService', {
        isUsernameTaken: of(false),
        getPasswordStrength: of(strongPassword),
        // Let the API report a failure
        signup: throwError(new Error('Validation failed')),
      });
      await setup();

      fillForm();

      expect(findEl(fixture, 'submit').properties.disabled).toBe(true);
      // Wait for async validators
      tick(1000);
      fixture.detectChanges();
      expect(findEl(fixture, 'submit').properties.disabled).toBe(false);
      findEl(fixture, 'form').triggerEventHandler('submit', {});
      fixture.detectChanges();
      expectText(fixture, 'status', 'Sign-up error');

      expect(signupService.isUsernameTaken).toHaveBeenCalledWith(username);
      expect(signupService.getPasswordStrength).toHaveBeenCalledWith(password);
      expect(signupService.signup).toHaveBeenCalledWith(signupData);
    }));
  });
});
