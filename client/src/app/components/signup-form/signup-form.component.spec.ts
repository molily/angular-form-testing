import { NO_ERRORS_SCHEMA } from '@angular/compiler';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import { PasswordStrength, SignupService } from 'src/app/services/signup.service';
import {
  click,
  dispatchFakeEvent,
  expectText,
  findEl,
  setCheckboxValue,
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
  'tos',
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

  const setup = async (
    signupServiceReturnValues?: jasmine.SpyObjMethodNames<SignupService>,
  ) => {
    signupService = jasmine.createSpyObj<SignupService>('SignupService', {
      // Successful responses per default
      isUsernameTaken: of(false),
      getPasswordStrength: of(strongPassword),
      signup: of({ success: true }),
      // Overwrite with given return values
      ...signupServiceReturnValues,
    });

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
    setCheckboxValue(fixture, 'tos', true);
  };

  describe('success case', () => {
    beforeEach(async () => {
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
      expectText(fixture, 'status', 'Sign-up successful!');

      expect(signupService.isUsernameTaken).toHaveBeenCalledWith(username);
      expect(signupService.getPasswordStrength).toHaveBeenCalledWith(password);
      expect(signupService.signup).toHaveBeenCalledWith(signupData);
    }));
  });

  describe('error case', () => {
    it('fails if the username is taken', fakeAsync(async () => {
      await setup({
        // Let the API return that the username is taken
        isUsernameTaken: of(true),
        getPasswordStrength: of(strongPassword),
        signup: of({ success: true }),
      });

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
      await setup({
        isUsernameTaken: of(false),
        // Let the API return that the password is weak
        getPasswordStrength: of(weakPassword),
        signup: of({ success: true }),
      });

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
      await setup();

      // Mark required form fields as touched.
      requiredFields.forEach((testId) => {
        dispatchFakeEvent(findEl(fixture, testId).nativeElement, 'blur');
      });

      fixture.detectChanges();

      requiredFields.forEach((testId) => {
        const el = findEl(fixture, testId);
        expect(el.attributes['aria-required']).toBe(
          'true',
          `${testId} must be marked as aria-required`,
        );
        expect(el.classes['ng-invalid']).toBe(true, `${testId} must be required`);
      });
    });

    it('requires address line 1 for business and non-profit plans', async () => {
      await setup();

      // Initial state
      const el = findEl(fixture, 'addressLine1');
      expect('ng-invalid' in el.classes).toBe(false);
      expect(el.attributes['aria-required']).toBe('false');

      // Change plan
      setCheckboxValue(fixture, 'plan-business', true);

      // Mark field as touched.
      dispatchFakeEvent(el.nativeElement, 'blur');
      fixture.detectChanges();

      expect(el.attributes['aria-required']).toBe('true');
      expect(el.classes['ng-invalid']).toBe(true);

      // Change plan
      setCheckboxValue(fixture, 'plan-non-profit', true);

      fixture.detectChanges();

      expect(el.attributes['aria-required']).toBe('true');
      expect(el.classes['ng-invalid']).toBe(true);
    });

    it('toggle the password display', async () => {
      await setup();

      setFieldValue(fixture, 'password', 'top secret');
      const passwordEl = findEl(fixture, 'password');
      expect(passwordEl.attributes.type).toBe('password');

      click(fixture, 'show-password');
      fixture.detectChanges();

      expect(passwordEl.attributes.type).toBe('text');

      click(fixture, 'show-password');
      fixture.detectChanges();

      expect(passwordEl.attributes.type).toBe('password');
    });

    it('handles signup failure', fakeAsync(async () => {
      await setup({
        isUsernameTaken: of(false),
        getPasswordStrength: of(strongPassword),
        // Let the API report a failure
        signup: throwError(new Error('Validation failed')),
      });

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
