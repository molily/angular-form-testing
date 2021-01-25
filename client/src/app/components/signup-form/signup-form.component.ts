import { Component } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormGroup,
  ValidationErrors,
  Validators,
} from '@angular/forms';
import { EMPTY, merge, Observable, Subject, timer } from 'rxjs';
import { catchError, debounceTime, first, map, mapTo, switchMap } from 'rxjs/operators';
import { PasswordStrength, Plan, SignupService } from 'src/app/services/signup.service';

const { email, maxLength, pattern, required, requiredTrue } = Validators;

/**
 * Wait for this time before sending async validation requests to the server.
 */
const ASYNC_VALIDATION_DELAY = 1000;

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss'],
})
export class SignupFormComponent {
  public PERSONAL: Plan = 'personal';
  public BUSINESS: Plan = 'business';
  public NON_PROFIT: Plan = 'non-profit';

  private passwordSubject = new Subject<string>();
  private passwordStrengthFromServer$ = this.passwordSubject.pipe(
    debounceTime(ASYNC_VALIDATION_DELAY),
    switchMap((password) =>
      this.signupService.getPasswordStrength(password).pipe(catchError(() => EMPTY)),
    ),
  );
  public passwordStrength$ = merge(
    this.passwordSubject.pipe(mapTo(null)),
    this.passwordStrengthFromServer$,
  );

  public showPassword = false;

  public form = this.formBuilder.group({
    plan: ['personal', required],
    username: [
      null,
      [required, pattern('[a-zA-Z0-9.]+'), maxLength(50)],
      (control: AbstractControl) => this.validateUsername(control.value),
    ],
    email: [
      null,
      [required, email, maxLength(100)],
      (control: AbstractControl) => this.validateEmail(control.value),
    ],
    password: [null, required, () => this.validatePassword()],
    tos: [null, requiredTrue],
    address: this.formBuilder.group({
      name: [null, required],
      addressLine1: [null],
      addressLine2: [null, required],
      city: [null, required],
      postcode: [null, required],
      region: [null],
      country: [null, required],
    }),
  });

  public plan = this.form.controls.plan;
  public addressLine1 = (this.form.controls.address as FormGroup).controls.addressLine1;

  public passwordStrength?: PasswordStrength;

  public submitProgress: 'idle' | 'success' | 'error' = 'idle';

  constructor(private signupService: SignupService, private formBuilder: FormBuilder) {
    this.plan.valueChanges.subscribe((plan: Plan) => {
      if (plan !== this.PERSONAL) {
        this.addressLine1.setValidators(required);
      } else {
        this.addressLine1.setValidators(null);
      }
      this.addressLine1.updateValueAndValidity();
    });
  }

  public getPasswordStrength(): void {
    this.passwordSubject.next(this.form.controls.password.value);
  }

  private validateUsername(username: string): Observable<ValidationErrors> {
    return timer(ASYNC_VALIDATION_DELAY).pipe(
      switchMap(() => this.signupService.isUsernameTaken(username)),
      map((usernameTaken) => (usernameTaken ? { taken: true } : {})),
    );
  }

  private validateEmail(username: string): Observable<ValidationErrors> {
    return timer(ASYNC_VALIDATION_DELAY).pipe(
      switchMap(() => this.signupService.isEmailTaken(username)),
      map((emailTaken) => (emailTaken ? { taken: true } : {})),
    );
  }

  private validatePassword(): Observable<ValidationErrors> {
    return this.passwordStrength$.pipe(
      first((passwordStrength) => passwordStrength !== null),
      map((passwordStrength) =>
        passwordStrength && passwordStrength.score < 3 ? { weak: true } : {},
      ),
    );
  }

  public onSubmit(): void {
    if (!this.form.valid) {
      return;
    }
    this.signupService.signup(this.form.value).subscribe(
      () => {
        this.submitProgress = 'success';
      },
      () => {
        this.submitProgress = 'error';
      },
    );
  }
}
