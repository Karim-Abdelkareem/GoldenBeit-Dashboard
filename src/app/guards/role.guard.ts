import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

// Routes allowed for Consultative role
const CONSULTATIVE_ALLOWED_ROUTES = [
  '/consultation-requests',
  '/profile',
  '/login',
];

// Routes allowed for Sales role
const SALES_ALLOWED_ROUTES = [
  '/unit-requests',
  '/unit-requests/salesstaff',
  '/profile',
  '/login',
];

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);

  const user = authService.getUser();

  // If no user, let auth guard handle it
  if (!user) {
    return true;
  }

  const roles: string[] = user.roles || [];
  const isConsultative = roles.includes('Consultative');
  const isSales = roles.includes('Sales');

  // If user is not Consultative or Sales, allow all routes
  if (!isConsultative && !isSales) {
    return true;
  }

  // Check if current route is allowed for Consultative role
  if (isConsultative) {
    const currentPath = state.url.split('?')[0]; // Remove query params

    const isAllowed = CONSULTATIVE_ALLOWED_ROUTES.some(allowedRoute =>
      currentPath === allowedRoute || currentPath.startsWith(allowedRoute + '/')
    );

    if (isAllowed) {
      return true;
    }

    // Redirect to consultation-requests if not allowed
    router.navigate(['/consultation-requests']);
    return false;
  }

  // Check if current route is allowed for Sales role
  if (isSales) {
    const currentPath = state.url.split('?')[0]; // Remove query params

    // Block access to /estate-units (list page) but allow /estate-units/details/:id
    if (currentPath === '/estate-units') {
      router.navigate(['/unit-requests/salesstaff']);
      return false;
    }

    // Allow estate-units/details routes
    if (currentPath.startsWith('/estate-units/details/')) {
      return true;
    }

    const isAllowed = SALES_ALLOWED_ROUTES.some(allowedRoute =>
      currentPath === allowedRoute || currentPath.startsWith(allowedRoute + '/')
    );

    if (isAllowed) {
      return true;
    }

    // Redirect to unit-requests/salesstaff if not allowed
    router.navigate(['/unit-requests/salesstaff']);
    return false;
  }

  return true;
};
