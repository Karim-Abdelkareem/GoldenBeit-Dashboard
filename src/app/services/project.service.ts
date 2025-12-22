import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../environment/environment';
import { Project, ProjectFormData } from '../interfaces/project';
import { Observable } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  constructor(private http: HttpClient) {}

  getProjects(page: number = 1, pageSize: number = 9): Observable<any> {
    return this.http.post<any>(`${environment.apiUrl}/v1/project/search`, {
      page,
      pageSize,
    });
  }
  getProject(id: string): Observable<Project> {
    return this.http.get<Project>(`${environment.apiUrl}/v1/project/${id}`);
  }
  addProject(project: ProjectFormData): Observable<Project> {
    return this.http.post<Project>(`${environment.apiUrl}/v1/project`, project);
  }
  updateProject(id: string, project: ProjectFormData): Observable<Project> {
    console.log(project);
    return this.http.put<Project>(`${environment.apiUrl}/v1/project/${id}`, project);
  }
  deleteProject(id: string): Observable<void> {
    return this.http.delete<void>(`${environment.apiUrl}/v1/project/${id}`);
  }
}
