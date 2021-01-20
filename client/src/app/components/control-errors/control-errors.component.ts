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
import { startWith } from 'rxjs/operators';
import { findFormControl } from 'src/app/util/findFormControl';

interface TemplateContext {
  $implicit: ValidationErrors;
}

@Component({
  selector: 'app-control-errors',
  templateUrl: './control-errors.component.html',
  styleUrls: ['./control-errors.component.scss'],
})
export class ControlErrorsComponent implements OnInit, OnDestroy {
  @Input()
  public control?: AbstractControl;

  @Input()
  public controlName?: string;

  public internalControl?: AbstractControl;

  @ContentChild(TemplateRef)
  public template: TemplateRef<TemplateContext> | null = null;

  public templateContext: TemplateContext = {
    $implicit: {},
  };

  private subscription?: Subscription;

  constructor(
    @Optional()
    private controlContainer?: ControlContainer,
  ) {}

  public ngOnInit(): void {
    const control = findFormControl(
      this.control,
      this.controlName,
      this.controlContainer,
    );
    this.internalControl = control;

    this.subscription = control.statusChanges
      .pipe(startWith('PENDING'))
      .subscribe((status) => {
        this.updateTemplateContext();
      });
  }

  private updateTemplateContext(): void {
    if (this.internalControl && this.internalControl.errors) {
      this.templateContext = {
        $implicit: this.internalControl.errors,
      };
    }
  }

  public ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }
}
