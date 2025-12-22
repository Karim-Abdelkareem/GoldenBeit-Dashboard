import { ChangeDetectorRef, Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { HotToastService } from '@ngxpert/hot-toast';
import { LucideAngularModule, Pencil, Trash2 } from 'lucide-angular';
import { ArticleCategory as ArticleCategoryInterface } from '../../interfaces/article.interface';
import { ArticlesCategoryService } from '../../services/articles-category.service';

@Component({
  selector: 'app-article-category',
  imports: [CommonModule, TableModule, ButtonModule, DialogModule, LucideAngularModule],
  templateUrl: './article-category.html',
  styleUrl: './article-category.css',
})
export class ArticleCategory {
  categories: ArticleCategoryInterface[] = [];
  deleteDialogVisible = false;
  selectedCategory: ArticleCategoryInterface | null = null;
  protected readonly Pencil = Pencil;
  protected readonly Trash2 = Trash2;

  constructor(
    protected router: Router,
    private hotToastService: HotToastService,
    private articlesCategoryService: ArticlesCategoryService,
    private cdr: ChangeDetectorRef
  ) {
    this.articlesCategoryService.getArticleCategories().subscribe(
      (response: any) => {
        this.categories = response.data;
        this.cdr.detectChanges();
      },
      (error) => {
        this.hotToastService.error('Failed to get article categories');
        this.cdr.detectChanges();
      }
    );
  }

  editCategory(category: ArticleCategoryInterface): void {
    this.router.navigate(['/article-categories/', category.id]);
  }

  deleteCategory(category: ArticleCategoryInterface): void {
    this.selectedCategory = category;
    this.deleteDialogVisible = true;
  }

  confirmDelete(): void {
    if (this.selectedCategory) {
      this.deleteDialogVisible = false;
      this.articlesCategoryService.deleteArticleCategory(this.selectedCategory!.id).subscribe(
        (response) => {
          this.hotToastService.success(`Category "${this.selectedCategory!.nameEn}" deleted successfully`);
          this.categories = this.categories.filter((c) => c.id !== this.selectedCategory!.id);
          this.cdr.detectChanges();
        },
        (error) => {
          this.hotToastService.error('Failed to delete category');
          this.cdr.detectChanges();
        }
      );
    }
  }

  cancelDelete(): void {
    this.deleteDialogVisible = false;
    this.selectedCategory = null;
  }
}
