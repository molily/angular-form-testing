import { Component, Type } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import {
  dispatchFakeEvent,
  findEl,
  setFieldElementValue,
} from '../spec-helpers/element.spec-helper';
import { ErrorMessageDirective } from './error-message.directive';

describe('ErrorMessageDirective', () => {
  let fixture: ComponentFixture<object>;

  let input: HTMLInputElement;

  const setup = async (HostComponent: Type<any>) => {
    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule],
      declarations: [ErrorMessageDirective, HostComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();

    input = findEl(fixture, 'input').nativeElement;
  };

  describe('passing the control', () => {
    @Component({
      template: `
        <input [formControl]="control" appErrorMessage="errors" data-testid="input" />
      `,
    })
    class HostComponent {
      public control = new FormControl(null, Validators.required);
    }

    beforeEach(async () => {
      await setup(HostComponent);
    });

    describe('valid control', () => {
      it('does nothing', () => {
        setFieldElementValue(input, 'something');
        fixture.detectChanges();
        expect(input.getAttribute('aria-invalid')).toBe(null);
        expect(input.getAttribute('aria-errormessage')).toBe(null);
      });
    });

    describe('invalid, pristine, untouched control', () => {
      it('does nothing', () => {
        expect(input.getAttribute('aria-invalid')).toBe(null);
        expect(input.getAttribute('aria-errormessage')).toBe(null);
      });
    });

    describe('invalid control, touched', () => {
      it('links the error message', () => {
        // Mark control as touched
        dispatchFakeEvent(input, 'blur');
        fixture.detectChanges();
        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(input.getAttribute('aria-errormessage')).toBe('errors');
      });
    });

    describe('invalid control, dirty', () => {
      it('links the error message', () => {
        // Mark control as dirty
        dispatchFakeEvent(input, 'input');
        fixture.detectChanges();
        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(input.getAttribute('aria-errormessage')).toBe('errors');
      });
    });
  });

  describe('passing the control name', () => {
    @Component({
      template: `
        <form [formGroup]="form">
          <input [formControl]="control" appErrorMessage="errors" data-testid="input" />
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
      it('does nothing', () => {
        setFieldElementValue(input, 'something');
        fixture.detectChanges();
        expect(input.getAttribute('aria-invalid')).toBe(null);
        expect(input.getAttribute('aria-errormessage')).toBe(null);
      });
    });

    describe('invalid, pristine, untouched control', () => {
      it('does nothing', () => {
        expect(input.getAttribute('aria-invalid')).toBe(null);
        expect(input.getAttribute('aria-errormessage')).toBe(null);
      });
    });

    describe('invalid control, touched', () => {
      it('links the error message', () => {
        // Mark control as touched
        dispatchFakeEvent(input, 'blur');
        fixture.detectChanges();
        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(input.getAttribute('aria-errormessage')).toBe('errors');
      });
    });

    describe('invalid control, dirty', () => {
      it('links the error message', () => {
        // Mark control as dirty
        dispatchFakeEvent(input, 'input');
        fixture.detectChanges();
        expect(input.getAttribute('aria-invalid')).toBe('true');
        expect(input.getAttribute('aria-errormessage')).toBe('errors');
      });
    });
  });

  describe('without control', () => {
    @Component({
      template: `<input appErrorMessage="errors" />`,
    })
    class HostComponent {}

    it('throws an error', async () => {
      await TestBed.configureTestingModule({
        imports: [ReactiveFormsModule],
        declarations: [ErrorMessageDirective, HostComponent],
      }).compileComponents();

      fixture = TestBed.createComponent(HostComponent);

      expect(() => {
        fixture.detectChanges();
      }).toThrow();
    });
  });
});
