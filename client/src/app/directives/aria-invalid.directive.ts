import { Directive, HostBinding, Input, OnInit, Optional } from '@angular/core';
import { AbstractControl, ControlContainer } from '@angular/forms';

import { findFormControl } from '../util/findFormControl';

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
  public formControl?: AbstractControl;

  @Input()
  public formControlName?: string;

  private control?: AbstractControl;

  constructor(@Optional() private controlContainer?: ControlContainer) {}

  public ngOnInit(): void {
    this.control = findFormControl(
      this.formControl,
      this.formControlName,
      this.controlContainer,
    );
  }
}
