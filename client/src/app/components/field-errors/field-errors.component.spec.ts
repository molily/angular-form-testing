import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import {
  enterText,
  expectContent,
  findEl,
} from 'src/app/spec-helpers/element.spec-helpers';

import { FieldErrorsComponent } from './field-errors.component';

describe('FieldErrorComponent', () => {
  let fixture: ComponentFixture<object>;

  let input: HTMLInputElement;

  const setup = async (HostComponent: Type<any>) => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [FieldErrorsComponent, HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    input = findEl(fixture, 'input').nativeElement;
  };

  describe('passing the control', () => {
    @Component({
      template: `
        <input [formControl]="control" data-testid="input" />
        <app-field-errors [control]="control">
          <ng-template let-errors>
            <ng-container *ngIf="errors.required">required</ng-container>
          </ng-template>
        </app-field-errors>
      `,
    })
    class HostComponent {
      public control = new FormControl(null, Validators.required);
    }

    beforeEach(async () => {
      await setup(HostComponent);
    });

    describe('valid control', () => {
      it('renders nothing', () => {
        enterText(input, 'something');
        fixture.detectChanges();
        expectContent(fixture, '');
      });
    });

    describe('invalid, pristine, untouched control', () => {
      it('renders nothing', () => {
        expectContent(fixture, '');
      });
    });

    describe('invalid control, touched', () => {
      it('renders the template', () => {
        // Mark control as touched
        input.dispatchEvent(new FocusEvent('blur'));
        fixture.detectChanges();
        expectContent(fixture, '❗ required');
        expect(findEl(fixture, 'field-error').attributes.role).toBe('alert');
      });
    });

    describe('invalid control, dirty', () => {
      it('renders the template', () => {
        // Mark control as dirty
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expectContent(fixture, '❗ required');
        expect(findEl(fixture, 'field-error').attributes.role).toBe('alert');
      });
    });
  });

  describe('passing the control name', () => {
    @Component({
      template: `
        <form [formGroup]="form">
          <input formControlName="control" data-testid="input" />
          <app-field-errors controlName="control">
            <ng-template let-errors>
              <ng-container *ngIf="errors.required">required</ng-container>
            </ng-template>
          </app-field-errors>
        </form>
      `,
    })
    class HostComponent {
      public control = new FormControl(null, Validators.required);
      public form = new FormGroup({ control: this.control });
    }

    beforeEach(async () => {
      await setup(HostComponent);
    });

    describe('valid control', () => {
      it('renders nothing', () => {
        enterText(input, 'something');
        fixture.detectChanges();
        expectContent(fixture, '');
      });
    });

    describe('invalid, pristine, untouched control', () => {
      it('renders nothing', () => {
        expectContent(fixture, '');
      });
    });

    describe('invalid control, touched', () => {
      it('renders the template', () => {
        // Mark control as touched
        input.dispatchEvent(new FocusEvent('blur'));
        fixture.detectChanges();
        expectContent(fixture, '❗ required');
        expect(findEl(fixture, 'field-error').attributes.role).toBe('alert');
      });
    });

    describe('invalid control, dirty', () => {
      it('renders the template', () => {
        // Mark control as dirty
        input.dispatchEvent(new Event('input'));
        fixture.detectChanges();
        expectContent(fixture, '❗ required');
        expect(findEl(fixture, 'field-error').attributes.role).toBe('alert');
      });
    });
  });

  describe('without control', () => {
    @Component({
      template: `
        <app-field-errors>
          <ng-template let-errors>
            <ng-container *ngIf="errors.required">required</ng-container>
          </ng-template>
        </app-field-errors>
      `,
    })
    class HostComponent {}

    it('throws an error', async () => {
      await TestBed.configureTestingModule({
        imports: [ReactiveFormsModule],
        declarations: [FieldErrorsComponent, HostComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(HostComponent);

      expect(() => {
        fixture.detectChanges();
      }).toThrow();
    });
  });

  describe('without template', () => {
    @Component({
      template: `
        <input [formControl]="control" data-testid="input" />
        <app-field-errors [control]="control"></app-field-errors>
      `,
    })
    class HostComponent {
      public control = new FormControl(null, Validators.required);
    }

    beforeEach(async () => {
      await setup(HostComponent);
    });

    it('renders the wrapper element', () => {
      // Mark control as dirty
      input.dispatchEvent(new Event('input'));
      fixture.detectChanges();
      expectContent(fixture, '❗');
      expect(findEl(fixture, 'field-error').attributes.role).toBe('alert');
    });
  });
});