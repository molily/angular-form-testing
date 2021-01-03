import {
  Component,
  ContentChild,
  Input,
  OnDestroy,
  OnInit,
  Optional,
  TemplateRef,
} from '@angular/core';
import { AbstractControl, ControlContainer, ValidationErrors } from '@angular/forms';
import { Subscription } from 'rxjs';

interface TemplateContext {
  $implicit: ValidationErrors;
}

@Component({
  selector: 'app-field-errors',
  templateUrl: './field-errors.component.html',
  styleUrls: ['./field-errors.component.css'],
})
export class FieldErrorsComponent implements OnInit, OnDestroy {
  @Input()
  public control?: AbstractControl;

  @Input()
  public controlName?: string;

  @ContentChild(TemplateRef)
  public template: TemplateRef<TemplateContext> | null = null;

  public templateContext: TemplateContext = {
    $implicit: {},
  };

  private subscription?: Subscription;

  constructor(@Optional() private controlContainer?: ControlContainer) {}

  public ngOnInit(): void {
    const { control, controlName } = this;
    if (control) {
      this.control = control;
    } else {
      if (!controlName) {
        throw new Error('FieldErrorsComponent: formControl or controlName must be given');
      }
      if (!(this.controlContainer && this.controlContainer.control)) {
        throw new Error(
          'FieldErrorsComponent: controlName was given but parent control not found',
        );
      }
      const controlFromName = this.controlContainer.control.get(controlName);
      if (!controlFromName) {
        throw new Error(`FieldErrorsComponent: control '${controlName}' not found`);
      }
      this.control = controlFromName;
    }
    this.updateTemplateContext();

    this.subscription = this.control.valueChanges.subscribe(() => {
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
