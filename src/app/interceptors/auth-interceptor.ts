import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, filter, take, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Clone request with auth headers
  const authReq = addTokenToRequest(req);

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401 && !req.url.includes('/tokens/refresh') && !req.url.includes('/tokens')) {
        return handle401Error(req, next, authService, router);
      }

      return throwError(() => error);
    })
  );
};

function addTokenToRequest(req: HttpRequest<any>): HttpRequest<any> {
  const token = localStorage.getItem('token');

  return req.clone({
    setHeaders: {
      tenant: 'root',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
}

function handle401Error(
  req: HttpRequest<any>,
  next: HttpHandlerFn,
  authService: AuthService,
  router: Router
) {
  // Check if we have a refresh token
  if (!authService.hasRefreshToken()) {
    // No refresh token, logout and redirect to login
    authService.logout();
    router.navigate(['/login']);
    return throwError(() => new Error('Session expired. Please login again.'));
  }

  // Check if we're already refreshing
  if (!authService.isRefreshingToken) {
    authService.isRefreshingToken = true;
    authService.refreshTokenSubject$.next(null);

    return authService.refreshToken().pipe(
      switchMap((response: any) => {
        authService.isRefreshingToken = false;
        authService.refreshTokenSubject$.next(response.token);

        // Retry the original request with new token
        return next(addTokenToRequest(req));
      }),
      catchError((refreshError) => {
        authService.isRefreshingToken = false;

        // Refresh failed, logout and redirect to login
        authService.logout();
        router.navigate(['/login']);

        return throwError(() => new Error('Session expired. Please login again.'));
      })
    );
  } else {
    // Wait for the token to be refreshed
    return authService.refreshTokenSubject$.pipe(
      filter((token) => token !== null),
      take(1),
      switchMap(() => {
        // Retry the original request with new token
        return next(addTokenToRequest(req));
      })
    );
  }
}
