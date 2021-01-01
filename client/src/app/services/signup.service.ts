import { Injectable } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';
import { of } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

export interface PasswordStrength {
  score: number;
  warning: string;
  suggestions: string[];
}

export interface SignupData {
  username: string;
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root',
})
export class SignupService {
  constructor(public http: HttpClient) {}

  public getPasswordStrength(password: string): Observable<PasswordStrength> {
    console.log('SignupService getPasswordStrength', password);
    return this.http.post<PasswordStrength>('/api/password-strength', { password });
  }

  public isUsernameTaken(username: string): Observable<boolean> {
    console.log('SignupService isUsernameTaken', username);
    return this.http
      .post<{ usernameTaken: boolean }>('/api/username-taken', { username })
      .pipe(map((result) => result.usernameTaken));
  }

  public signup(data: SignupData): Observable<{ success: true }> {
    console.log('SignupService signup', data);
    return this.http.post<{ success: true }>('/api/signup', data);
  }
}
