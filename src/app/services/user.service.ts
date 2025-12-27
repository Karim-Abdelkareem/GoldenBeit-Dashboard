import { Injectable } from '@angular/core';
import { CreateUserInterface, UpdateUserInterface } from '../interfaces/user.interface';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  constructor(private http: HttpClient) {}
  createUser(user: CreateUserInterface) {
    return this.http.post(`${environment.apiUrl}/users`, user, {
      responseType: 'text',
    });
  }

  getUsers() {
    console.log(`${environment.apiUrl}/users`);
    return this.http.get(`${environment.apiUrl}/users`);
  }

  getUser(id: string) {
    return this.http.get(`${environment.apiUrl}/users/${id}`);
  }

  updateUser(id: string, user: UpdateUserInterface) {
    return this.http.put(`${environment.apiUrl}/users/profile/${id}`, user);
  }

  toggleUserStatus(id: string, activateUser: boolean) {
    return this.http.post(`${environment.apiUrl}/users/${id}/toggle-status`, {
      activateUser: activateUser,
      userId: id,
    });
  }

  getUserRoles(id: string) {
    return this.http.get(`${environment.apiUrl}/users/${id}/roles`);
  }

  addUserRole(id: string, userRoles: any[]) {
    return this.http.post(
      `${environment.apiUrl}/users/${id}/roles`,
      { userRoles },
      { responseType: 'text' }
    );
  }
}
