import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { signupData } from '../spec-helpers/signup-data.spec-helper';
import { PasswordStrength, SignupService } from './signup.service';

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
    const username = 'minnie';

    let result: boolean | undefined;
    service.isUsernameTaken(username).subscribe((otherResult) => {
      result = otherResult;
    });

    const request = controller.expectOne({ method: 'POST', url: '/api/username-taken' });
    expect(request.request.body).toEqual({ username });
    request.flush({ usernameTaken: true });

    expect(result).toBe(true);
  });

  it('gets the password strength', () => {
    const password = 'abcdef';
    const passwordStrength: PasswordStrength = {
      score: 2,
      warning: 'too short',
      suggestions: ['try a longer password'],
    };

    let result: PasswordStrength | undefined;
    service.getPasswordStrength(password).subscribe((otherResult) => {
      result = otherResult;
    });

    const request = controller.expectOne({
      method: 'POST',
      url: '/api/password-strength',
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
      url: '/api/signup',
    });
    expect(request.request.body).toEqual(signupData);
    request.flush({ success: true });

    expect(result).toEqual({ success: true });
  });
});
