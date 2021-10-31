import { Component, ViewChild } from '@angular/core';
import { AbstractControl, NgForm, ValidationErrors } from '@angular/forms';
import { EMPTY, merge, Observable, Subject, timer } from 'rxjs';
import {
  catchError,
  debounceTime,
  map,
  mapTo,
  switchMap,
  takeWhile,
  tap,
} from 'rxjs/operators';
import {
  PasswordStrength,
  Plan,
  SignupData,
  SignupService,
} from 'src/app/services/signup.service';

/**
 * Wait for this duration before sending async validation requests to the server.
 */
const ASYNC_VALIDATION_DELAY = 1000;

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss'],
})
export class SignupFormComponent {
  @ViewChild(NgForm)
  public form?: NgForm;

  public PERSONAL: Plan = 'personal';
  public BUSINESS: Plan = 'business';
  public NON_PROFIT: Plan = 'non-profit';

  private passwordSubject = new Subject<string>();
  private passwordStrengthFromServer$ = this.passwordSubject.pipe(
    debounceTime(ASYNC_VALIDATION_DELAY),
    tap(() => {}),
    switchMap((password) =>
      this.signupService.getPasswordStrength(password).pipe(catchError(() => EMPTY)),
    ),
  );
  public passwordStrength$ = merge(
    this.passwordSubject.pipe(mapTo(null)),
    this.passwordStrengthFromServer$,
  );

  public showPassword = false;

  public model: SignupData = {
    plan: this.PERSONAL,
    username: '',
    email: '',
    password: '',
    address: {
      name: '',
      addressLine1: '',
      addressLine2: '',
      city: '',
      postcode: '',
      region: '',
      country: '',
    },
    tos: false,
  };

  public passwordStrength?: PasswordStrength;

  public submitProgress: 'idle' | 'success' | 'error' = 'idle';

  constructor(private signupService: SignupService) {}

  public getPasswordStrength(): void {
    this.passwordSubject.next(this.model.password);
  }

  public validateUsername = (control: AbstractControl): Observable<ValidationErrors | null> => {
    const username = control.value;
    return timer(ASYNC_VALIDATION_DELAY).pipe(
      switchMap(() => this.signupService.isUsernameTaken(username)),
      map((usernameTaken) => (usernameTaken ? { taken: true } : {})),
    );
  }

  public validateEmail = (control: AbstractControl): Observable<ValidationErrors | null> => {
    const email = control.value;
    return timer(ASYNC_VALIDATION_DELAY).pipe(
      switchMap(() => this.signupService.isEmailTaken(email)),
      map((emailTaken) => (emailTaken ? { taken: true } : {})),
    );
  }

  public validatePassword = (control: AbstractControl): Observable<ValidationErrors | null> => {
    return this.passwordStrength$.pipe(
      // Make sure the observable completes
      takeWhile((passwordStrength) => !passwordStrength, true),
      map((passwordStrength) =>
        passwordStrength && passwordStrength.score < 3 ? { weak: true } : {},
      ),
    );
  }

  public onSubmit(): void {
    if (!this.form?.valid) {
      return;
    }
    this.signupService.signup(this.model).subscribe(
      () => {
        this.submitProgress = 'success';
      },
      () => {
        this.submitProgress = 'error';
      },
    );
  }
}
