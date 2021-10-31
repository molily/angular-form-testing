import {
  Component,
  ContentChild,
  Input,
  OnDestroy,
  OnInit,
  TemplateRef,
} from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';
import { startWith } from 'rxjs/operators';

interface TemplateContext {
  $implicit: ValidationErrors;
}

/**
 * Shows the errors for a given form control.
 *
 * Expects a template that is rendered when the control is invalid and touched.
 * The `errors` object is passed to the template as template input variable.
 *
 * @example
 * <input type="password" ngModel #password="ngModel" required>
 * <app-control-errors [control]="password.control">
 *   <ng-template let-errors>
 *     <ng-container *ngIf="errors.required"> Password must be given. </ng-container>
 *     <ng-container *ngIf="errors.weak"> Password is too weak. </ng-container>
 *   </ng-template>
 * </app-control-errors>
 */
@Component({
  selector: 'app-control-errors',
  templateUrl: './control-errors.component.html',
  styleUrls: ['./control-errors.component.scss'],
})
export class ControlErrorsComponent implements OnInit, OnDestroy {
  @Input()
  public control?: AbstractControl;

  @ContentChild(TemplateRef)
  public template: TemplateRef<TemplateContext> | null = null;

  public templateContext: TemplateContext = {
    $implicit: {},
  };

  public internalControl?: AbstractControl;

  private subscription?: Subscription;

  public ngOnInit(): void {
    if (!this.control) {
      throw new Error('ControlErrorsComponent: control not given');
    }
    this.subscription = this.control.statusChanges
      .pipe(startWith('PENDING'))
      .subscribe(() => {
        this.updateTemplateContext();
      });
  }

  private updateTemplateContext(): void {
    if (this.control && this.control.errors) {
      this.templateContext = {
        $implicit: this.control.errors,
      };
    }
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
