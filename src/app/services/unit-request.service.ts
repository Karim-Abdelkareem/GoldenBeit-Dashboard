import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class UnitRequestService {
  constructor(private http: HttpClient) { }

  getUnitRequests(page: number = 1, pageSize: number = 9) {
    return this.http.post(`${environment.apiUrl}/v1/unitrequest/search`, {
      pageNumber: page,
      pageSize,
      orderBy: ['createdOn desc'],
    });
  }

  getUnitRequest(id: string) {
    return this.http.get(`${environment.apiUrl}/v1/unitrequest/${id}`);
  }

  addUnitRequest(unitRequest: any) {
    return this.http.post(`${environment.apiUrl}/v1/unitrequest`, unitRequest);
  }

  updateUnitRequest(id: string, unitRequest: any) {
    return this.http.put(`${environment.apiUrl}/v1/unitrequest/${id}`, { id, ...unitRequest });
  }

  deleteUnitRequest(id: string) {
    return this.http.delete(`${environment.apiUrl}/v1/unitrequest/${id}`);
  }

  updateUnitRequestStatus(id: string, status: number) {
    return this.http.put(`${environment.apiUrl}/v1/unitrequest/updateunitrequeststatus/${id}`, { id, status });
  }

  salesStaffUnitRequests(salesStaffId: string) {
    return this.http.post(`${environment.apiUrl}/v1/unitrequest/salesstaff`, {
      salesStaffId,
    });
  }

  assignUnitRequestToSalesStaff(unitRequestId: string, salesStaffId: string) {
    return this.http.post(`${environment.apiUrl}/v1/unitrequest/${unitRequestId}/assign-sales`, {
      unitRequestId,
      salesStaffId,
    });
  }
}
