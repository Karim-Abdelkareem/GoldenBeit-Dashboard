import { Component, signal, computed, ChangeDetectorRef } from '@angular/core';
import {
  LucideAngularModule,
  X,
  ChevronRight,
  ChevronLeft,
  MoveUpLeft,
  Pencil,
  Trash2,
  Plus,
} from 'lucide-angular';
import { ArticleResponseData, Article as ArticleData } from '../../interfaces/article.interface';
import { ArticlesService } from '../../services/articles.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { HotToastService } from '@ngxpert/hot-toast';
import { environment } from '../../environment/environment';

@Component({
  selector: 'app-article',
  imports: [LucideAngularModule, CommonModule, DialogModule],
  templateUrl: './article.html',
  styleUrl: './article.css',
})
export class Article {
  protected readonly X = X;
  protected readonly ChevronRight = ChevronRight;
  protected readonly ChevronLeft = ChevronLeft;
  protected readonly MoveUpLeft = MoveUpLeft;
  protected readonly Pencil = Pencil;
  protected readonly Trash2 = Trash2;
  protected readonly Plus = Plus;
  url = environment.imageUrl;
  articles = signal<ArticleData[]>([]);
  today = new Date();
  page = signal<number>(1);
  totalPages = signal<number>(73);
  itemsPerPage = signal<number>(10);
  totalItems = signal<number>(730);
  hasNextPage = signal<boolean>(false);
  hasPreviousPage = signal<boolean>(false);

  showStartEllipsis = signal<boolean>(false);
  showEndEllipsis = signal<boolean>(false);

  deleteDialogVisible = false;
  selectedArticle: ArticleData | null = null;

  // Computed signal for visible page numbers
  visiblePages = computed(() => {
    const currentPage = this.page();
    const total = this.totalPages();
    const pages: number[] = [];

    // Show 5 pages around current page (2 before, current, 2 after)
    const start = Math.max(1, currentPage - 2);
    const end = Math.min(total, currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  });

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages()) {
      this.page.set(pageNumber);
    }
  }

  goToPrevious(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
    }
  }

  goToNext(): void {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
    }
  }
  constructor(
    private articlesService: ArticlesService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private hotToastService: HotToastService
  ) {}

  ngOnInit(): void {
    this.articlesService.getArticles().subscribe((response: any) => {
      console.log('Articles Response:', response);
      this.articles.set(response.data);
      this.totalPages.set(response.totalPages);
      this.totalItems.set(response.totalCount);
      this.page.set(response.currentPage);
      this.hasNextPage.set(response.hasNextPage);
      this.hasPreviousPage.set(response.hasPreviousPage);
      this.showStartEllipsis.set(response.showStartEllipsis);
      this.showEndEllipsis.set(response.showEndEllipsis);
      this.cdr.detectChanges();
    });
  }

  editArticle(article: ArticleData): void {
    this.router.navigate(['/articles/edit/', article.id]);
  }

  deleteArticle(article: ArticleData): void {
    this.selectedArticle = article;
    this.deleteDialogVisible = true;
  }

  confirmDelete(): void {
    if (this.selectedArticle) {
      this.articlesService.deleteArticle(this.selectedArticle.id).subscribe(
        (response: any) => {
          this.articles.set(this.articles().filter((a) => a.id !== this.selectedArticle!.id));
          this.hotToastService.success(
            `Article "${this.selectedArticle!.titleEn}" deleted successfully`
          );
          this.deleteDialogVisible = false;
          this.selectedArticle = null;
          this.cdr.detectChanges();
        },
        (error: any) => {
          this.hotToastService.error('Failed to delete article');
          this.deleteDialogVisible = false;
          this.selectedArticle = null;
        }
      );
    }
  }

  cancelDelete(): void {
    this.deleteDialogVisible = false;
    this.selectedArticle = null;
  }

  articleDetails(article: ArticleData): void {
    this.router.navigate(['/articles/details/', article.id]);
  }
}
