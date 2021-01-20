import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';

import { AppComponent } from './app.component';
import { ControlErrorsComponent } from './components/control-errors/control-errors.component';
import { SignupFormComponent } from './components/signup-form/signup-form.component';
import { ErrorMessageDirective } from './directives/error-message.directive';

@NgModule({
  declarations: [
    AppComponent,
    SignupFormComponent,
    ErrorMessageDirective,
    ControlErrorsComponent,
  ],
  imports: [BrowserModule, ReactiveFormsModule, HttpClientModule],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
