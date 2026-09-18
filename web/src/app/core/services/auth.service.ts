import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'stake_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // signal para a UI poder reagir (ex: esconder a sidebar quando não autenticado)
  isAuthenticated = signal(!!localStorage.getItem(TOKEN_KEY));

  constructor(private http: HttpClient) {}

  login(password: string): Observable<{ token: string }> {
    return this.http.post<{ token: string }>(`${environment.apiUrl}/auth/login`, { password }).pipe(
      tap(res => {
        localStorage.setItem(TOKEN_KEY, res.token);
        this.isAuthenticated.set(true);
      })
    );
  }

  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    this.isAuthenticated.set(false);
  }

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }
}
