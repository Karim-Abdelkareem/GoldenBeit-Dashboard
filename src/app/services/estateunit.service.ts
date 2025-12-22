import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class EstateunitService {
  constructor(private http: HttpClient) {}

  getEstateUnits(page: number = 1, pageSize: number = 9) {
    return this.http.post(`${environment.apiUrl}/v1/estateunit/search`, {
      page,
      pageSize,
    });
  }

  getEstateUnit(id: string) {
    return this.http.get(`${environment.apiUrl}/v1/estateunit/${id}`);
  }

  updateEstateUnit(id: string, estateUnit: any) {
    return this.http.put(`${environment.apiUrl}/v1/estateunit/${id}`, estateUnit, {});
  }

  deleteEstateUnit(id: string) {
    return this.http.delete(`${environment.apiUrl}/v1/estateunit/${id}`);
  }
}
