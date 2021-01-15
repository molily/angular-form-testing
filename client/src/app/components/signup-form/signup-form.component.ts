import { Component } from '@angular/core';
import { FormBuilder, FormControl, ValidationErrors, Validators } from '@angular/forms';
import { EMPTY, merge, Observable, Subject, timer } from 'rxjs';
import { catchError, debounceTime, first, map, mapTo, switchMap } from 'rxjs/operators';
import { PasswordStrength, Plan, SignupService } from 'src/app/services/signup.service';

const { email, maxLength, pattern, required, requiredTrue } = Validators;

@Component({
  selector: 'app-signup-form',
  templateUrl: './signup-form.component.html',
  styleUrls: ['./signup-form.component.scss'],
})
export class SignupFormComponent {
  public PERSONAL: Plan = 'personal';
  public BUSINESS: Plan = 'business';
  public NON_PROFIT: Plan = 'non-profit';

  public passwordSubject = new Subject<string>();
  public passwordStrengthFromServer$ = this.passwordSubject.pipe(
    debounceTime(1000),
    switchMap((password) =>
      this.signupService.getPasswordStrength(password).pipe(catchError(() => EMPTY)),
    ),
  );
  public passwordStrength$ = merge(
    this.passwordSubject.pipe(mapTo(null)),
    this.passwordStrengthFromServer$,
  );
  public showPassword = false;

  public plan = this.formBuilder.control('personal', required);
  public addressLine1 = this.formBuilder.control(null);

  public form = this.formBuilder.group({
    plan: this.plan,
    username: [
      null,
      [required, maxLength(50), pattern('[a-zA-Z0-9.]+')],
      (control: FormControl) => this.usernameValidator(control),
    ],
    email: [null, [required, email]],
    password: [null, required, () => this.passwordValidator()],
    tos: [null, requiredTrue],
    address: this.formBuilder.group({
      name: [null, required],
      addressLine1: this.addressLine1,
      addressLine2: [null, required],
      city: [null, required],
      postcode: [null, required],
      region: [null],
      country: [null, required],
    }),
  });

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

  public usernameValidator(control: FormControl): Observable<ValidationErrors> {
    return timer(1000).pipe(
      switchMap(() => this.signupService.isUsernameTaken(control.value)),
      map((usernameTaken) => (usernameTaken ? { taken: true } : {})),
    );
  }

  public getPasswordStrength(): void {
    this.passwordSubject.next(this.form.controls.password.value);
  }

  public passwordValidator(): Observable<ValidationErrors> {
    return this.passwordStrength$.pipe(
      first((passwordStrength) => passwordStrength !== null),
      map((passwordStrength) =>
        passwordStrength && passwordStrength.score < 3 ? { weak: true } : {},
      ),
    );
  }

  public onSubmit(): void {
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
