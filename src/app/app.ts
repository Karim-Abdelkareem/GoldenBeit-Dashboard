import { Component, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { jwtDecode } from 'jwt-decode';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  constructor(private authService: AuthService) {
    // User is now loaded automatically from localStorage in AuthService constructor
    // If no user in storage but token exists, try to decode token as fallback
    const token = localStorage.getItem('token');
    if (token && !authService.getUser()) {
      try {
        const user = jwtDecode(token);
        authService.updateUser(user);
      } catch (error) {
        console.error('Error decoding token:', error);
        localStorage.removeItem('token');
      }
    }
  }
}
