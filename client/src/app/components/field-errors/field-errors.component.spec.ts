import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldErrorsComponent } from './field-errors.component';

describe('FieldErrorComponent', () => {
  let component: FieldErrorsComponent;
  let fixture: ComponentFixture<FieldErrorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FieldErrorsComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FieldErrorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
