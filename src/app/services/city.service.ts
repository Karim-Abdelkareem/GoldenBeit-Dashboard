import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { CityFormData, CityInterface } from '../interfaces/city.interface';

@Injectable({
  providedIn: 'root',
})
export class CityService {
  constructor(private http: HttpClient) {}

  getCities(page: number = 1, pageSize: number = 9) {
    const requestBody = {
      pageNumber: page, // API uses 1-based indexing (based on response currentPage: 1)
      pageSize: pageSize,
      orderBy: ['createdOn desc'],
    };
    return this.http.post(`${environment.apiUrl}/v1/city/search`, requestBody, {
      headers: {
        tenant: 'root',
      },
    });
  }

  deleteCity(id: string) {
    return this.http.delete(`${environment.apiUrl}/v1/city/${id}`, {
      headers: {
        tenant: 'root',
      },
    });
  }

  addCity(city: CityFormData) {
    return this.http.post(`${environment.apiUrl}/v1/city`, city, {
      headers: {
        tenant: 'root',
      },
    });
  }

  getCity(id: string) {
    return this.http.get(`${environment.apiUrl}/v1/city/${id}`, {
      headers: {
        tenant: 'root',
      },
    });
  }

  updateCity(id: string, city: CityFormData) {
    return this.http.put(`${environment.apiUrl}/v1/city/${id}`, city, {
      headers: {
        tenant: 'root',
      },
    });
  }
}
