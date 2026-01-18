import { ChangeDetectorRef, Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { HotToastService } from '@ngxpert/hot-toast';
import {
  LucideAngularModule,
  Plus,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Pencil,
} from 'lucide-angular';
import { CompanyReviewsService } from '../../services/company-reviews.service';
import { CompanyReviewsInterface } from '../../interfaces/company-reviews.interface';

@Component({
  selector: 'app-company-reviews',
  imports: [CommonModule, DialogModule, LucideAngularModule],
  templateUrl: './company-reviews.html',
  styleUrl: './company-reviews.css',
})
export class CompanyReviews {
  companyReviews = signal<CompanyReviewsInterface[]>([]);
  deleteDialogVisible = false;
  selectedReview: CompanyReviewsInterface | null = null;
  page = signal<number>(1);
  totalPages = signal<number>(1);
  itemsPerPage = signal<number>(9);
  totalItems = signal<number>(0);
  hasNextPage = signal<boolean>(false);
  hasPreviousPage = signal<boolean>(false);
  showStartEllipsis = signal<boolean>(false);
  showEndEllipsis = signal<boolean>(false);
  protected readonly Plus = Plus;
  protected readonly Trash2 = Trash2;
  protected readonly Pencil = Pencil;
  protected readonly ChevronLeft = ChevronLeft;
  protected readonly ChevronRight = ChevronRight;
  

  // Computed signal for visible page numbers
  visiblePages = computed(() => {
    const currentPage = this.page();
    const total = this.totalPages();
    const pages: number[] = [];

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(total, currentPage + 2);

    for (let i = start; i <= end; i++) {
      pages.push(i);
    }

    return pages;
  });

  constructor(
    private companyReviewsService: CompanyReviewsService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private hotToastService: HotToastService
  ) {
    this.loadReviews();
  }

  loadReviews(): void {
    const currentPage = this.page();
    this.companyReviewsService.getCompanyReviews(currentPage, this.itemsPerPage()).subscribe(
      (response: any) => {
        this.companyReviews.set(response.data || []);
        console.log(this.companyReviews());
        this.totalPages.set(response.totalPages || 1);
        this.totalItems.set(response.totalCount || 0);
        this.page.set(currentPage);
        this.hasNextPage.set(response.hasNextPage || false);
        this.hasPreviousPage.set(response.hasPreviousPage || false);

        const totalPages = response.totalPages || 1;
        this.showStartEllipsis.set(currentPage > 3);
        this.showEndEllipsis.set(currentPage < totalPages - 2);

        this.cdr.detectChanges();
      },
      (error) => {
        this.hotToastService.error('Failed to get company reviews');
        this.cdr.detectChanges();
      }
    );
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages()) {
      this.page.set(pageNumber);
      this.loadReviews();
      this.scrollToTop();
    }
  }

  goToPrevious(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.loadReviews();
      this.scrollToTop();
    }
  }

  goToNext(): void {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
      this.loadReviews();
      this.scrollToTop();
    }
  }

  deleteReview(review: CompanyReviewsInterface): void {
    this.selectedReview = review;
    this.deleteDialogVisible = true;
    console.log(review);
    // this.companyReviewsService.deleteCompanyReview(review?.id).subscribe(
    //   (response: any) => {
    //     this.hotToastService.success('Review deleted successfully');
    //     this.deleteDialogVisible = false;
    //     this.selectedReview = null;
    //     this.loadReviews();
    //   },
    //   (error: any) => {
    //     this.hotToastService.error('Failed to delete review');
    //     this.deleteDialogVisible = false;
    //     this.selectedReview = null;
    //   }
    // );
  }

  confirmDelete(): void {
    if (this.selectedReview && this.selectedReview.id) {
      this.companyReviewsService.deleteCompanyReview(this.selectedReview.id).subscribe(
        (response: any) => {
          this.hotToastService.success('Review deleted successfully');
          this.deleteDialogVisible = false;
          this.selectedReview = null;
          this.loadReviews();
        },
        (error: any) => {
          this.hotToastService.error('Failed to delete review');
          this.deleteDialogVisible = false;
          this.selectedReview = null;
        }
      );
    }
  }

  editReview(review: CompanyReviewsInterface): void {
    console.log(review);

    this.router.navigate(['/company-reviews/edit/', review.id]);
  }

  cancelDelete(): void {
    this.deleteDialogVisible = false;
    this.selectedReview = null;
  }

  addReview(): void {
    this.router.navigate(['/company-reviews/add']);
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  getStarsArray(rating: number): number[] {
    return Array.from({ length: 5 }, (_, i) => i + 1);
  }
}
