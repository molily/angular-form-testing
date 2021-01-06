import { NO_ERRORS_SCHEMA } from '@angular/compiler';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { of, throwError } from 'rxjs';
import {
  PasswordStrength,
  SignupData,
  SignupService,
} from 'src/app/services/signup.service';
import {
  click,
  expectText,
  findEl,
  setFieldValue,
} from 'src/app/spec-helpers/element.spec-helpers';
import { FieldErrorsComponent } from '../field-errors/field-errors.component';

import { SignupFormComponent } from './signup-form.component';

const username = 'quickBrownFox';
const password = 'dog lazy the over jumps fix brown quick the';
const email = 'quick.brown.fox@example.org';
const name = 'Mr. Fox';
const addressLine1 = '';
const addressLine2 = 'Under the Tree 1';
const city = 'Farmtown';
const postcode = '123456';
const region = 'Upper South';
const country = 'Luggnagg';
const expectedSignupData: SignupData = {
  username,
  email,
  password,
  address: { name, addressLine1, addressLine2, city, postcode, region, country },
};

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

// const setFieldValueAndMakeDirty = (testId: string, value: string) => {
//   setFieldValue(fixture, testId, value);
//   // (findEl(fixture, testId).nativeElement as HTMLElement).dispatchEvent(
//   //   new FocusEvent('blur'),
//   // );
// };

type Func = (...args: any[]) => any;
type ReturnValues<T> = { [P in keyof T]?: T[P] extends Func ? ReturnType<T[P]> : any };

const successSignupService: ReturnValues<SignupService> = {
  isUsernameTaken: of(false),
  getPasswordStrength: of(strongPassword),
  signup: of({ success: true }),
};

fdescribe('SignupFormComponent', () => {
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
    // Country is a select element, so we need to simulate a change event
    (findEl(fixture, 'country').nativeElement as HTMLElement).dispatchEvent(
      new Event('change'),
    );
  };

  describe('success case', () => {
    beforeEach(async () => {
      signupService = jasmine.createSpyObj<SignupService>(
        'SignupService',
        successSignupService,
      );
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
      expect(signupService.signup).toHaveBeenCalledWith(expectedSignupData);
    }));
  });

  describe('error case', () => {
    it('fails if the username is taken', fakeAsync(async () => {
      signupService = jasmine.createSpyObj<SignupService>('SignupService', {
        ...successSignupService,
        // Let the API return that the username is taken
        isUsernameTaken: of(true),
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
        ...successSignupService,
        // Let the API return that the password is weak
        getPasswordStrength: of(weakPassword),
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

    it('handles signup failure', fakeAsync(async () => {
      signupService = jasmine.createSpyObj<SignupService>('SignupService', {
        ...successSignupService,
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
      expect(signupService.signup).toHaveBeenCalledWith(expectedSignupData);
    }));
  });
});
