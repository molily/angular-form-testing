import { Directive, Input } from '@angular/core';
import {
  AbstractControl,
  AsyncValidator,
  NG_ASYNC_VALIDATORS,
  ValidationErrors,
} from '@angular/forms';
import { Observable } from 'rxjs';

/**
 * Directive for quickly setting an async validator.
 * Adapted from Tim Deschryver’s ValidatorDirective:
 * https://timdeschryver.dev/blog/a-generic-angular-template-driven-validator
 *
 * @example
 * <input type="password" [appAsyncValidator]="validatePassword">
 */
@Directive({
  selector: '[appAsyncValidator]',
  providers: [
    { provide: NG_ASYNC_VALIDATORS, useExisting: AsyncValidatorDirective, multi: true },
  ],
})
export class AsyncValidatorDirective implements AsyncValidator {
  @Input()
  appAsyncValidator?: (control: AbstractControl) => Observable<ValidationErrors | null>;

  validate(control: AbstractControl): Observable<ValidationErrors | null> {
    if (!this.appAsyncValidator) {
      throw new Error('AsyncValidatorDirective: validator not set');
    }
    return this.appAsyncValidator(control);
  }
}
