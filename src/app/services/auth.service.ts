import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  constructor(private http: HttpClient) {}

  user = signal<any | null>(null);

  login(email: string, password: string) {
    return this.http.post(`${environment.apiUrl}/tokens`, { email, password }).pipe(
      tap((response: any) => {
        this.user.set(response.user);
        localStorage.setItem('token', response.token);
      })
    );
  }

  getUser() {
    return this.user();
  }

  getToken() {
    return localStorage.getItem('token');
  }

  isLoggedIn() {
    return this.getToken() !== null;
  }

  logout() {
    this.user.set(null);
    localStorage.clear();
  }
}
