import { Directive, HostBinding, Input, OnInit, Optional } from '@angular/core';
import { NgControl } from '@angular/forms';

/**
 * Directive that sets the `aria-invalid` and `aria-errormessage` attributes
 * when the form control is invalid and touched or dirty.
 *
 * https://w3c.github.io/aria/#aria-invalid
 * https://w3c.github.io/aria/#aria-errormessage
 *
 * Expects that the element has an NgControl binding.
 *
 * Expects the id of the element that contains the error messages.
 *
 * Usage examples:
 *
 *   <input [(ngModel)]="username" appErrorMessage="username-errors">
 *   <div id="username-errors">…</div>
 */
@Directive({
  selector: '[appErrorMessage]',
})
export class ErrorMessageDirective implements OnInit {
  @HostBinding('attr.aria-invalid')
  get ariaInvalid(): true | null {
    return this.isActive() ? true : null;
  }

  @HostBinding('attr.aria-errormessage')
  get ariaErrormessage(): string | null {
    return this.isActive() && this.appErrorMessage ? this.appErrorMessage : null;
  }

  @Input()
  public appErrorMessage?: string;

  constructor(
    // Marked as optional but checked on runtime
    @Optional()
    private control?: NgControl
  ) {}

  public ngOnInit(): void {
    if (!this.control) {
      throw new Error('ErrorMessageDirective: no control found on element');
    }
  }

  /**
   * Whether the link to the errors is established.
   */
  private isActive(): boolean {
    const { control } = this;
    return Boolean(
      control !== undefined && control.invalid && (control.touched || control.dirty),
    );
  }
}
