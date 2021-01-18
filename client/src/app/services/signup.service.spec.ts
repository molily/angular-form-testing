import { HttpErrorResponse } from '@angular/common/http';
import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { signupData } from '../spec-helpers/signup-data.spec-helper';
import { PasswordStrength, SignupService } from './signup.service';

const username = 'minnie';
const email = 'minnie@mouse.net';
const password = 'abcdef';

const passwordStrength: PasswordStrength = {
  score: 2,
  warning: 'too short',
  suggestions: ['try a longer password'],
};

describe('SignupService', () => {
  let service: SignupService;
  let controller: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(SignupService);
    controller = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    controller.verify();
  });

  it('checks if the username is taken', () => {
    let result: boolean | undefined;
    service.isUsernameTaken(username).subscribe((otherResult) => {
      result = otherResult;
    });

    const request = controller.expectOne({
      method: 'POST',
      url: 'http://localhost:4200/api/username-taken',
    });
    expect(request.request.body).toEqual({ username });
    request.flush({ usernameTaken: true });

    expect(result).toBe(true);
  });

  it('checks if the email is taken', () => {
    let result: boolean | undefined;
    service.isEmailTaken(email).subscribe((otherResult) => {
      result = otherResult;
    });

    const request = controller.expectOne({
      method: 'POST',
      url: 'http://localhost:4200/api/email-taken',
    });
    expect(request.request.body).toEqual({ email });
    request.flush({ emailTaken: true });

    expect(result).toBe(true);
  });

  it('gets the password strength', () => {
    let result: PasswordStrength | undefined;
    service.getPasswordStrength(password).subscribe((otherResult) => {
      result = otherResult;
    });

    const request = controller.expectOne({
      method: 'POST',
      url: 'http://localhost:4200/api/password-strength',
    });
    expect(request.request.body).toEqual({ password });
    request.flush(passwordStrength);

    expect(result).toBe(passwordStrength);
  });

  it('signs up', () => {
    let result: { success: true } | undefined;
    service.signup(signupData).subscribe((otherResult) => {
      result = otherResult;
    });

    const request = controller.expectOne({
      method: 'POST',
      url: 'http://localhost:4200/api/signup',
    });
    expect(request.request.body).toEqual(signupData);
    request.flush({ success: true });

    expect(result).toEqual({ success: true });
  });

  it('passes the errors through', () => {
    const errors: HttpErrorResponse[] = [];
    const recordError = (error: HttpErrorResponse) => {
      errors.push(error);
    };

    service.isUsernameTaken(username).subscribe(fail, recordError, fail);
    service.getPasswordStrength(password).subscribe(fail, recordError, fail);
    service.signup(signupData).subscribe(fail, recordError, fail);

    const status = 500;
    const statusText = 'Internal Server Error';
    const errorEvent = new ErrorEvent('API error');

    const requests = controller.match(() => true);
    requests.forEach((request) => {
      request.error(errorEvent, { status, statusText });
    });

    expect(errors.length).toBe(3);
    errors.forEach((error) => {
      expect(error.error).toBe(errorEvent);
      expect(error.status).toBe(status);
      expect(error.statusText).toBe(statusText);
    });
  });
});
