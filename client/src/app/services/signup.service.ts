import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';

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
  address: {
    name: string;
    addressLine1?: string;
    addressLine2: string;
    city: string;
    postcode: string;
    region?: string;
    country: string;
  };
  tos: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class SignupService {
  constructor(private http: HttpClient) {}

  public isUsernameTaken(username: string): Observable<boolean> {
    return this.post<{ usernameTaken: boolean }>('/username-taken', {
      username,
    }).pipe(map((result) => result.usernameTaken));
  }

  public isEmailTaken(email: string): Observable<boolean> {
    return this.post<{ emailTaken: boolean }>('/email-taken', { email }).pipe(
      map((result) => result.emailTaken),
    );
  }

  public getPasswordStrength(password: string): Observable<PasswordStrength> {
    return this.post<PasswordStrength>('/password-strength', {
      password,
    });
  }

  public signup(data: SignupData): Observable<{ success: true }> {
    return this.post<{ success: true }>('/signup', data);
  }

  private post<Response>(path: string, data: any): Observable<Response> {
    return this.http.post<Response>(`${environment.signupServiceUrl}${path}`, data);
  }
}
