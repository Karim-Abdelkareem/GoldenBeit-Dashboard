import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class TermsAndConditionsService {
  constructor(private http: HttpClient) {}
  getTermsAndConditions(page: number = 1, pageSize: number = 9): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/v1/termcondition/search`, {
      page,
      pageSize,
    });
  }
  getTermAndCondition(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/v1/termcondition/${id}`);
  }
  addTermAndCondition(termAndCondition: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/v1/termcondition`, termAndCondition);
  }
  updateTermAndCondition(id: string, termAndCondition: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/v1/termcondition/${id}`, termAndCondition);
  }
  deleteTermAndCondition(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/v1/termcondition/${id}`);
  }
}
