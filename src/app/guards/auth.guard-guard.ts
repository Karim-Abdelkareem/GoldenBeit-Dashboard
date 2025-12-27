import { CanActivateFn } from '@angular/router';
import { jwtDecode } from 'jwt-decode';
import { Router } from '@angular/router';
import { inject } from '@angular/core';

export const authGuardGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const token = localStorage.getItem('token');
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  const decodedToken = jwtDecode(token);
  console.log(decodedToken);
  if (decodedToken.exp! < Date.now() / 1000!) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
