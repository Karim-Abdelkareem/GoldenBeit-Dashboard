import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { CompanyReviewFormData } from '../interfaces/company-reviews.interface';

@Injectable({
  providedIn: 'root',
})
export class CompanyReviewsService {
  constructor(private http: HttpClient) {}

  getCompanyReviews(page: number = 1, pageSize: number = 9) {
    return this.http.post(
      `${environment.apiUrl}/v1/companyreview/search`,
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

  addCompanyReview(companyReview: CompanyReviewFormData) {
    return this.http.post(`${environment.apiUrl}/v1/companyreview`, companyReview, {
      headers: {
        tenant: 'root',
      },
    });
  }

  getCompanyReview(id: string) {
    return this.http.get(`${environment.apiUrl}/v1/companyreview/${id}`, {
      headers: {
        tenant: 'root',
      },
    });
  }

  updateCompanyReview(id: string, companyReview: CompanyReviewFormData) {
    return this.http.put(`${environment.apiUrl}/v1/companyreview/${id}`, companyReview, {
      headers: {
        tenant: 'root',
      },
    });
  }

  deleteCompanyReview(id: string) {
    return this.http.delete(`${environment.apiUrl}/v1/companyreview/${id}`, {
      headers: {
        tenant: 'root',
      },
    });
  }
}
