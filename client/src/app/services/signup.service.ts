import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface PasswordStrength {
  score: number;
  warning: string;
  suggestions: string[];
}

export type Plan = 'personal' | 'business' | 'non-profit';

export interface SignupData {
  plan: Plan;
  username: string;
  email: string;
  password: string;
  tos: true;
  address: {
    name: string;
    addressLine1?: string;
    addressLine2: string;
    city: string;
    postcode: string;
    region?: string;
    country: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class SignupService {
  constructor(public http: HttpClient) {}

  public isUsernameTaken(username: string): Observable<boolean> {
    return this.http
      .post<{ usernameTaken: boolean }>('/api/username-taken', { username })
      .pipe(map((result) => result.usernameTaken));
  }

  public isEmailTaken(email: string): Observable<boolean> {
    return this.http
      .post<{ emailTaken: boolean }>('/api/email-taken', { email })
      .pipe(map((result) => result.emailTaken));
  }

  public getPasswordStrength(password: string): Observable<PasswordStrength> {
    return this.http.post<PasswordStrength>('/api/password-strength', { password });
  }

  public signup(data: SignupData): Observable<{ success: true }> {
    return this.http.post<{ success: true }>('/api/signup', data);
  }
}
