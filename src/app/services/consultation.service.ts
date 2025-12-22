import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { ConsultationFormData } from '../interfaces/cosultation.interface';

@Injectable({
  providedIn: 'root',
})
export class ConsultationService {
  constructor(private http: HttpClient) {}

  getConsultations(page: number = 1, pageSize: number = 9) {
    return this.http.post(
      `${environment.apiUrl}/v1/consultation/search`,
      {
        pageNumber: page,
        pageSize: pageSize,
      },
      {
        headers: {
          tenant: 'root',
        },
      }
    );
  }

  addConsultation(consultation: ConsultationFormData) {
    return this.http.post(`${environment.apiUrl}/v1/consultation`, consultation, {
      headers: {
        tenant: 'root',
      },
    });
  }

  getConsultation(id: string) {
    return this.http.get(`${environment.apiUrl}/v1/consultation/${id}`, {
      headers: {
        tenant: 'root',
      },
    });
  }

  updateConsultation(id: string, consultation: ConsultationFormData) {
    return this.http.put(`${environment.apiUrl}/v1/consultation/${id}`, consultation, {
      headers: {
        tenant: 'root',
      },
    });
  }

  deleteConsultation(id: string) {
    return this.http.delete(`${environment.apiUrl}/v1/consultation/${id}`, {
      headers: {
        tenant: 'root',
      },
    });
  }
}
