import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userSubject = new BehaviorSubject<any | null>(null);
  public user$: Observable<any | null> = this.userSubject.asObservable();

  // Keep signal for backward compatibility
  user = signal<any | null>(null);

  // Flag to prevent multiple refresh requests
  private isRefreshing = false;
  private refreshTokenSubject = new BehaviorSubject<string | null>(null);

  constructor(private http: HttpClient) {
    // Load user from localStorage on service initialization
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const user = JSON.parse(storedUser);
        this.userSubject.next(user);
        this.user.set(user);
      } catch (error) {
        console.error('Error parsing stored user:', error);
        localStorage.removeItem('user');
      }
    }
  }

  private saveUserToStorage(user: any): void {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }

  login(email: string, password: string) {
    return this.http.post(`${environment.apiUrl}/tokens`, { email, password }).pipe(
      tap((response: any) => {
        // Merge roles and permissions from root level into user object
        const userWithRole = {
          ...response.user,
          roles: response.roles || response.user?.roles || [],
          permissions: response.permissions || [],
        };

        // Save user to BehaviorSubject and localStorage
        this.userSubject.next(userWithRole);
        this.user.set(userWithRole);
        this.saveUserToStorage(userWithRole);
        localStorage.setItem('token', response.token);
        // Store refresh token if provided
        if (response.refreshToken) {
          localStorage.setItem('refreshToken', response.refreshToken);
        }
      })
    );
  }

  refreshToken(): Observable<any> {
    const token = this.getToken();
    const refreshToken = this.getRefreshToken();

    return this.http
      .post(`${environment.apiUrl}/tokens/refresh`, {
        token,
        refreshToken,
      })
      .pipe(
        tap((response: any) => {
          // Update tokens in localStorage
          if (response.token) {
            localStorage.setItem('token', response.token);
          }
          if (response.refreshToken) {
            localStorage.setItem('refreshToken', response.refreshToken);
          }
          // Update user if provided
          if (response.user) {
            this.userSubject.next(response.user);
            this.user.set(response.user);
            this.saveUserToStorage(response.user);
          }
        })
      );
  }

  getUser() {
    // Return current value from BehaviorSubject
    return this.userSubject.value;
  }

  getToken() {
    return localStorage.getItem('token');
  }

  getRefreshToken() {
    return localStorage.getItem('refreshToken');
  }

  hasRefreshToken(): boolean {
    return !!this.getRefreshToken();
  }

  isLoggedIn() {
    return this.getToken() !== null && this.getUser() !== null;
  }

  logout() {
    this.userSubject.next(null);
    this.user.set(null);
    localStorage.clear();
  }

  // Method to update user (useful after profile update)
  updateUser(user: any): void {
    this.userSubject.next(user);
    this.user.set(user);
    this.saveUserToStorage(user);
  }

  // Getters for refresh state management (used by interceptor)
  get isRefreshingToken(): boolean {
    return this.isRefreshing;
  }

  set isRefreshingToken(value: boolean) {
    this.isRefreshing = value;
  }

  get refreshTokenSubject$(): BehaviorSubject<string | null> {
    return this.refreshTokenSubject;
  }
}
