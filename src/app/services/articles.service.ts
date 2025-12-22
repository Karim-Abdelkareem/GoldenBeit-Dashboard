import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { ArticleFormData } from '../interfaces/article.interface';

@Injectable({
  providedIn: 'root',
})
export class ArticlesService {
  constructor(private http: HttpClient) {}

  addArticle(article: ArticleFormData) {
    return this.http.post(`${environment.apiUrl}/v1/article`, article);
  }

  getArticles() {
    return this.http.post(`${environment.apiUrl}/v1/article/search`, {});
  }

  updateArticle(id: string, article: ArticleFormData) {
    return this.http.put(`${environment.apiUrl}/v1/article/${id}`, article, {});
  }
  getArticle(id: string) {
    return this.http.get(`${environment.apiUrl}/v1/article/${id}`);
  }

  deleteArticle(id: string) {
    return this.http.delete(`${environment.apiUrl}/v1/article/${id}`);
  }
}
