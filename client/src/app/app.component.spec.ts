import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TestBed } from '@angular/core/testing';

import { AppComponent } from './app.component';
import { findComponent } from './spec-helpers/element.spec-helper';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppComponent],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  it('renders the sign-up form', () => {
    const fixture = TestBed.createComponent(AppComponent);
    expect(findComponent(fixture, 'app-signup-form')).toBeTruthy();
  });
});
