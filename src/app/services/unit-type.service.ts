import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class UnitTypeService {
  constructor(private http: HttpClient) {}

  getUnitTypes(page: number = 1, pageSize: number = 9) {
    return this.http.post(`${environment.apiUrl}/v1/unittype/search`, {
      page,
      pageSize,
    });
  }

  getUnitType(id: string) {
    return this.http.get(`${environment.apiUrl}/v1/unittype/${id}`);
  }

  addUnitType(unitType: any) {
    return this.http.post(`${environment.apiUrl}/v1/unittype`, unitType);
  }
  updateUnitType(id: string, unitType: any) {
    return this.http.put(`${environment.apiUrl}/v1/unittype/${id}`, unitType);
  }
  deleteUnitType(id: string) {
    return this.http.delete(`${environment.apiUrl}/v1/unittype/${id}`);
  }
}
