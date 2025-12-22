import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ArticlesService } from '../../../services/articles.service';
import { Article as ArticleData } from '../../../interfaces/article.interface';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-article-details',
  imports: [CommonModule, LucideAngularModule, DatePipe],
  templateUrl: './article-details.html',
  styleUrl: './article-details.css',
})
export class ArticleDetails implements OnInit {
  article = signal<ArticleData | null>(null);
  loading = signal<boolean>(true);
  protected readonly ArrowLeft = ArrowLeft;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private articlesService: ArticlesService,
    private hotToastService: HotToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadArticle(id);
    } else {
      this.hotToastService.error('Article ID not found');
      this.router.navigate(['/articles']);
    }
  }

  loadArticle(id: string): void {
    this.loading.set(true);
    this.articlesService.getArticle(id).subscribe(
      (response: any) => {
        this.article.set(response);
        this.loading.set(false);
      },
      (error: any) => {
        this.hotToastService.error('Failed to load article');
        this.loading.set(false);
        this.router.navigate(['/articles']);
      }
    );
  }

  goBack(): void {
    this.router.navigate(['/articles']);
  }
}
