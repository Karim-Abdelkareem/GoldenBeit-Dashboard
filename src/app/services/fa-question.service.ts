import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { FaQuestionFormData } from '../interfaces/fa-question';

@Injectable({
  providedIn: 'root',
})
export class FaQuestionService {
  constructor(private http: HttpClient) {}

  getFaQuestions(page: number = 1, pageSize: number = 9) {
    return this.http.post(`${environment.apiUrl}/v1/faquestion/search`, {
      page,
      pageSize,
    });
  }
  getFaQuestion(id: string) {
    return this.http.get(`${environment.apiUrl}/v1/faquestion/${id}`);
  }
  addFaQuestion(faQuestion: FaQuestionFormData) {
    return this.http.post(`${environment.apiUrl}/v1/faquestion`, faQuestion);
  }
  updateFaQuestion(id: string, faQuestion: FaQuestionFormData) {
    return this.http.put(`${environment.apiUrl}/v1/faquestion/${id}`, faQuestion);
  }
  deleteFaQuestion(id: string) {
    return this.http.delete(`${environment.apiUrl}/v1/faquestion/${id}`);
  }
}
