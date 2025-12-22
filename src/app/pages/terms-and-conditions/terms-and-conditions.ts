import { Component, signal, computed, ChangeDetectorRef } from '@angular/core';
import {
  LucideAngularModule,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Trash2,
  Plus,
  Eye,
  FileText,
} from 'lucide-angular';
import { TermsAndConditionsInterface } from '../../interfaces/terms-and-conditions.interface';
import { TermsAndConditionsService } from '../../services/terms-and-conditions.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { HotToastService } from '@ngxpert/hot-toast';
import { splitIncludes } from '../../utils/string.utils';

interface TermsAndConditionsItem extends TermsAndConditionsInterface {
  parsedContentAr?: string[];
  parsedContentEn?: string[];
}

@Component({
  selector: 'app-terms-and-conditions',
  imports: [LucideAngularModule, CommonModule, DialogModule],
  templateUrl: './terms-and-conditions.html',
  styleUrl: './terms-and-conditions.css',
})
export class TermsAndConditions {
  termsAndConditions = signal<TermsAndConditionsItem[]>([]);
  deleteDialogVisible = false;
  detailsDialogVisible = false;
  selectedTerm: TermsAndConditionsItem | null = null;
  page = signal<number>(1);
  totalPages = signal<number>(1);
  itemsPerPage = signal<number>(9);
  totalItems = signal<number>(0);
  hasNextPage = signal<boolean>(false);
  hasPreviousPage = signal<boolean>(false);
  showStartEllipsis = signal<boolean>(false);
  showEndEllipsis = signal<boolean>(false);
  loading = signal<boolean>(true);

  protected readonly Pencil = Pencil;
  protected readonly Trash2 = Trash2;
  protected readonly Plus = Plus;
  protected readonly ChevronLeft = ChevronLeft;
  protected readonly ChevronRight = ChevronRight;
  protected readonly Eye = Eye;
  protected readonly FileText = FileText;

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
    private termsService: TermsAndConditionsService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private hotToastService: HotToastService
  ) {}

  ngOnInit(): void {
    this.loadTermsAndConditions();
  }

  loadTermsAndConditions(): void {
    this.loading.set(true);
    const currentPage = this.page();
    this.termsService.getTermsAndConditions(currentPage, this.itemsPerPage()).subscribe(
      (response: any) => {
        const terms = (response.data || []).map((term: TermsAndConditionsInterface) => ({
          ...term,
          parsedContentAr: splitIncludes(term.contentAr),
          parsedContentEn: splitIncludes(term.contentEn),
        }));
        this.termsAndConditions.set(terms);
        this.totalPages.set(response.totalPages || 1);
        this.totalItems.set(response.totalCount || 0);
        this.page.set(currentPage);
        this.hasNextPage.set(response.hasNextPage || false);
        this.hasPreviousPage.set(response.hasPreviousPage || false);

        const totalPages = response.totalPages || 1;
        this.showStartEllipsis.set(currentPage > 3);
        this.showEndEllipsis.set(currentPage < totalPages - 2);

        this.loading.set(false);
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error loading terms and conditions:', error);
        this.hotToastService.error('Failed to load terms and conditions');
        this.loading.set(false);
        this.cdr.detectChanges();
      }
    );
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages()) {
      this.page.set(pageNumber);
      this.loadTermsAndConditions();
      this.scrollToTop();
    }
  }

  goToPrevious(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.loadTermsAndConditions();
      this.scrollToTop();
    }
  }

  goToNext(): void {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
      this.loadTermsAndConditions();
      this.scrollToTop();
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  viewDetails(term: TermsAndConditionsItem): void {
    this.selectedTerm = term;
    this.detailsDialogVisible = true;
  }

  closeDetailsDialog(): void {
    this.detailsDialogVisible = false;
    this.selectedTerm = null;
  }

  editTerm(term: TermsAndConditionsItem): void {
    this.router.navigate(['/terms-and-conditions/edit/', term.id]);
  }

  deleteTerm(term: TermsAndConditionsItem): void {
    this.selectedTerm = term;
    this.deleteDialogVisible = true;
  }

  confirmDelete(): void {
    if (this.selectedTerm && this.selectedTerm.id) {
      this.termsService.deleteTermAndCondition(this.selectedTerm.id).subscribe(
        (response: any) => {
          this.termsAndConditions.set(
            this.termsAndConditions().filter((t) => t.id !== this.selectedTerm!.id)
          );
          this.hotToastService.success(
            `Terms and conditions "${this.selectedTerm!.titleEn || this.selectedTerm!.titleAr}" deleted successfully`
          );
          this.deleteDialogVisible = false;
          this.selectedTerm = null;
          this.cdr.detectChanges();
        },
        (error: any) => {
          this.hotToastService.error('Failed to delete terms and conditions');
          this.deleteDialogVisible = false;
          this.selectedTerm = null;
        }
      );
    }
  }

  cancelDelete(): void {
    this.deleteDialogVisible = false;
    this.selectedTerm = null;
  }

  addTerm(): void {
    this.router.navigate(['/terms-and-conditions/add']);
  }
}
