import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { ConsultationFormData } from '../interfaces/cosultation.interface';

@Injectable({
  providedIn: 'root',
})
export class ConsultationService {
  constructor(private http: HttpClient) { }

  getConsultations(page: number = 1, pageSize: number = 9) {
    return this.http.post(
      `${environment.apiUrl}/v1/consultation/search`,
      {
        pageNumber: page,
        pageSize: pageSize,
        orderBy: ['createdOn desc'],
      },
      {
        headers: {
          tenant: 'root',
        },
      }
    );
  }

  getAllConsultations() {
    // Fetch all consultations with a large page size
    return this.http.post(
      `${environment.apiUrl}/v1/consultation/search`,
      {
        pageNumber: 1,
        pageSize: 1000, // Large number to get all consultations
        orderBy: ['createdOn desc'],
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

  getConsultationRequests(page: number = 1, pageSize: number = 10, filters?: any) {
    const requestBody: any = {
      pageNumber: page,
      pageSize: pageSize,
      orderBy: ['createdOn desc'],
    };

    // Add search - using advancedSearch for consultationNameEn and consultationNameAr
    if (filters?.searchQuery && filters.searchQuery.trim()) {
      requestBody.advancedSearch = {
        fields: ['consultationNameEn', 'consultationNameAr'],
        keyword: filters.searchQuery.trim(),
      };
    }

    // Add filters
    if (filters) {
      if (filters.status) {
        requestBody.status = filters.status;
      }
      if (filters.consultationId) {
        requestBody.consultationId = filters.consultationId;
      }
      if (filters.userId) {
        requestBody.userId = filters.userId;
      }
    }

    return this.http.post(`${environment.apiUrl}/v1/consultationrequest/search`, requestBody, {
      headers: {
        tenant: 'root',
      },
    });
  }

  getConsultationRequest(id: string) {
    return this.http.get(`${environment.apiUrl}/v1/consultationrequest/${id}`, {
      headers: {
        tenant: 'root',
      },
    });
  }

  updateConsultationRequestStatus(
    id: string,
    consultationId: string,
    consultativeId: string | null | undefined,
    status: string,
    staffMsg?: string
  ) {
    return this.http.put(
      `${environment.apiUrl}/v1/consultationrequest/${id}`,
      {
        id,
        consultationId,
        consultativeId: consultativeId || null,
        status,
        staffMsg: staffMsg || null,
      },
      {
        headers: {
          tenant: 'root',
        },
      }
    );
  }

  deleteConsultationRequest(id: string) {
    return this.http.delete(`${environment.apiUrl}/v1/consultationrequest/${id}`, {
      headers: {
        tenant: 'root',
      },
    });
  }

  getConsultationsForConsultative(consultativeId: string) {
    return this.http.post(
      `${environment.apiUrl}/v1/consultationrequest/consultative`,
      {
        consultativeId: consultativeId,
      },
      {
        headers: {
          tenant: 'root',
        },
      }
    );
  }
}
