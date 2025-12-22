import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../environment/environment';
import { ArticleCategoryFormData } from '../interfaces/article.interface';

@Injectable({
  providedIn: 'root',
})
export class ArticlesCategoryService {
  constructor(private http: HttpClient) {}

  addArticleCategory(articleCategory: ArticleCategoryFormData) {
    return this.http.post(`${environment.apiUrl}/v1/articlecategory`, articleCategory, {
      headers: {
        tenant: 'root',
      },
    });
  }

  getArticleCategories() {
    return this.http.post(
      `${environment.apiUrl}/v1/articlecategory/search`,
      {},
      {
        headers: {
          tenant: 'root',
        },
      }
    );
  }

  getArticleCategory(id: string) {
    return this.http.get(`${environment.apiUrl}/v1/articlecategory/${id}`, {
      headers: {
        tenant: 'root',
      },
    });
  }

  deleteArticleCategory(id: string) {
    return this.http.delete(`${environment.apiUrl}/v1/articlecategory/${id}`, {
      headers: {
        tenant: 'root',
      },
    });
  }

  updateArticleCategory(id: string, { id: string, ...articleCategory }: any) {
    return this.http.put(
      `${environment.apiUrl}/v1/articlecategory/${id}`,
      { id, ...articleCategory },
      {
        headers: {
          tenant: 'root',
        },
      }
    );
  }
}
