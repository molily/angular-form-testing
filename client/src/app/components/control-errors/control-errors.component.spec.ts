import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormsModule, Validators } from '@angular/forms';
import {
  dispatchFakeEvent,
  expectContent,
  findEl,
  setFieldElementValue,
} from 'src/app/spec-helpers/element.spec-helper';

import { ControlErrorsComponent } from './control-errors.component';

describe('ControlErrorComponent', () => {
  let fixture: ComponentFixture<object>;

  let input: HTMLInputElement;

  const setup = async (HostComponent: Type<any>) => {
    await TestBed.configureTestingModule({
      imports: [FormsModule],
      declarations: [ControlErrorsComponent, HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    input = findEl(fixture, 'input').nativeElement;
  };

  describe('passing the control', () => {
    @Component({
      template: `
        <input ngModel #input="ngModel" required data-testid="input">
        <app-control-errors [control]="input.control">
          <ng-template let-errors>
            <ng-container *ngIf="errors.required">required</ng-container>
          </ng-template>
        </app-control-errors>
      `,
    })
    class HostComponent {
      public control = new FormControl(null, Validators.required);
    }

    beforeEach(async () => {
      await setup(HostComponent);
    });

    describe('valid', () => {
      it('renders nothing', () => {
        setFieldElementValue(input, 'something');
        fixture.detectChanges();
        expectContent(fixture, '');
      });
    });

    describe('invalid, pristine, untouched', () => {
      it('renders nothing', () => {
        expectContent(fixture, '');
      });
    });

    describe('invalid, pristine, touched', () => {
      it('renders the template', () => {
        // Mark control as touched
        dispatchFakeEvent(input, 'blur');
        fixture.detectChanges();
        expectContent(fixture, '❗ required');
        expect(findEl(fixture, 'control-error').attributes.role).toBe('alert');
      });
    });

    describe('invalid, dirty, touched, ', () => {
      it('renders the template', () => {
        // Mark control as touched & dirty
        dispatchFakeEvent(input, 'input');
        fixture.detectChanges();
        expectContent(fixture, '❗ required');
        expect(findEl(fixture, 'control-error').attributes.role).toBe('alert');
      });
    });
  });

  describe('without control', () => {
    @Component({
      template: `
        <app-control-errors>
          <ng-template let-errors>
            <ng-container *ngIf="errors.required">required</ng-container>
          </ng-template>
        </app-control-errors>
      `,
    })
    class HostComponent {}

    it('throws an error', async () => {
      await TestBed.configureTestingModule({
        imports: [FormsModule],
        declarations: [ControlErrorsComponent, HostComponent],
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
        <input ngModel #input="ngModel" required data-testid="input">
        <app-control-errors [control]="input.control"></app-control-errors>
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
      expectContent(fixture, '❗ ');
      expect(findEl(fixture, 'control-error').attributes.role).toBe('alert');
    });
  });
});
