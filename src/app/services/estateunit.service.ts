import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';

@Injectable({
  providedIn: 'root',
})
export class EstateunitService {
  constructor(private http: HttpClient) { }

  getEstateUnits(page: number = 1, pageSize: number = 9, filters?: any) {
    const requestBody: any = {
      pageNumber: page,
      pageSize,
      orderBy: ['createdOn desc'],
    };

    // Add search - using advancedSearch for titleEn and titleAr
    if (filters?.searchQuery && filters.searchQuery.trim()) {
      requestBody.advancedSearch = {
        fields: ['titleEn', 'titleAr'],
        keyword: filters.searchQuery.trim(),
      };
    }

    // Add filters
    if (filters) {
      if (filters.status !== undefined && filters.status !== null) {
        requestBody.status = Number(filters.status);
      }
      if (filters.cityId) {
        requestBody.cityId = filters.cityId;
      }
      if (filters.unitNumber) {
        requestBody.unitNumber = filters.unitNumber;
      }
      if (filters.phoneNumber) {
        requestBody.phoneNumber = filters.phoneNumber;
      }
      if (filters.forType !== undefined && filters.forType !== null) {
        requestBody.forType = Number(filters.forType);
      }

      // Add price filters using advancedFilter
      const priceFilters: any[] = [];
      if (filters.minPrice !== undefined && filters.minPrice !== null) {
        priceFilters.push({
          field: 'totalPrice',
          operator: 'gte',
          value: Number(filters.minPrice),
        });
      }
      if (filters.maxPrice !== undefined && filters.maxPrice !== null) {
        priceFilters.push({
          field: 'totalPrice',
          operator: 'lte',
          value: Number(filters.maxPrice),
        });
      }

      if (priceFilters.length > 0) {
        if (priceFilters.length === 1) {
          requestBody.advancedFilter = priceFilters[0];
        } else {
          requestBody.advancedFilter = {
            logic: 'and',
            filters: priceFilters,
          };
        }
      }
    }

    return this.http.post(`${environment.apiUrl}/v1/estateunit/admin-search`, requestBody);
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

  updateEstateUnitStatus(id: string, status: number, approverMessage?: string, isApproved?: boolean) {
    return this.http.put(
      `${environment.apiUrl}/v1/estateunit/updateunitstatus/${id}`,
      {
        id,
        status: Number(status),
        approverMessage: approverMessage || null,
        isApproved: isApproved !== undefined ? isApproved : null,
      },
      {
        headers: {
          tenant: 'root',
        },
      }
    );
  }
}
