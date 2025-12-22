import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../environment/environment';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class StagesService {
  constructor(private http: HttpClient) {}
  getStages(page: number = 1, pageSize: number = 9): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/v1/stage/search`, {
      page,
      pageSize,
    });
  }
  getStage(id: string): Observable<any> {
    return this.http.get<any>(`${environment.apiUrl}/v1/stage/${id}`);
  }
  addStage(stage: any): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/v1/stage`, stage);
  }
  updateStage(id: string, stage: any): Observable<any> {
    return this.http.put<any>(`${environment.apiUrl}/v1/stage/${id}`, stage);
  }
  deleteStage(id: string): Observable<any> {
    return this.http.delete<any>(`${environment.apiUrl}/v1/stage/${id}`);
  }
}
