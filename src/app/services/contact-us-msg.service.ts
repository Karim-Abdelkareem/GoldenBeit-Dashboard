import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class ContactUsMsgService {
  constructor(private http: HttpClient) {}

  getContactUsMessages() {
    return this.http.post<any[]>(`${environment.apiUrl}/v1/contactusmsg/search`, {});
  }

  getContactUsMessage(id: string) {
    return this.http.get<any>(`${environment.apiUrl}/v1/contactusmsg/${id}`);
  }
}
