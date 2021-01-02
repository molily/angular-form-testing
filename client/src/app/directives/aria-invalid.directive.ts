import { Directive, HostBinding, Input, OnInit, Optional } from '@angular/core';
import { AbstractControl, ControlContainer, FormControl } from '@angular/forms';

/**
 * Directive that sets the aria-invalid attribute if the form control
 * is invalid and touched or dirty.
 *
 * Expects that the element also has a formControl or formControlName input.
 *
 * Usage:
 *
 *   <input [formControl]="usernameFormControl" appAriaInvalid>
 *   <input formControlName="username" appAriaInvalid>
 */
@Directive({
  selector: '[appAriaInvalid]',
})
export class AriaInvalidDirective implements OnInit {
  @HostBinding('attr.aria-invalid')
  get ariaInvalid(): boolean {
    const { control } = this;
    return control !== undefined && control.invalid && (control.touched || control.dirty);
  }

  @Input()
  public formControl?: FormControl;

  @Input()
  public formControlName?: string;

  private control?: AbstractControl;

  constructor(@Optional() private controlContainer?: ControlContainer) {}

  public ngOnInit(): void {
    const { formControl, formControlName } = this;
    if (formControl) {
      this.control = formControl;
    } else {
      if (!formControlName) {
        throw new Error(
          'AriaInvalidDirective: formControl or formControlName must be given',
        );
      }
      if (!(this.controlContainer && this.controlContainer.control)) {
        throw new Error(
          'AriaInvalidDirective: formControlName was given but parent control not found',
        );
      }
      const control = this.controlContainer.control.get(formControlName);
      if (!control) {
        throw new Error(`AriaInvalidDirective: control '${formControlName}' not found`);
      }
      this.control = control;
    }
  }
}
