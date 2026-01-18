import { Component, signal, computed, ChangeDetectorRef } from '@angular/core';
import {
  LucideAngularModule,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Trash2,
  Plus,
  HelpCircle,
  Eye,
  MessageSquare,
  Tag,
} from 'lucide-angular';
import { FaQuestion as FaQuestionInterface } from '../../interfaces/fa-question';
import { FaQuestionService } from '../../services/fa-question.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-fa-question',
  imports: [LucideAngularModule, CommonModule, DialogModule],
  templateUrl: './fa-question.html',
  styleUrl: './fa-question.css',
})
export class FaQuestion {
  faQuestions = signal<FaQuestionInterface[]>([]);
  deleteDialogVisible = false;
  detailsDialogVisible = false;
  selectedQuestion: FaQuestionInterface | null = null;
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
  protected readonly HelpCircle = HelpCircle;
  protected readonly Eye = Eye;
  protected readonly MessageSquare = MessageSquare;
  protected readonly Tag = Tag;

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
    private faQuestionService: FaQuestionService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private hotToastService: HotToastService
  ) {}

  ngOnInit(): void {
    this.loadFaQuestions();
  }

  loadFaQuestions(): void {
    this.loading.set(true);
    const currentPage = this.page();
    this.faQuestionService.getFaQuestions(currentPage, this.itemsPerPage()).subscribe(
      (response: any) => {
        this.faQuestions.set(response.data || []);
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
        console.error('Error loading FA Questions:', error);
        this.hotToastService.error('Failed to load FA Questions');
        this.loading.set(false);
        this.cdr.detectChanges();
      }
    );
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages()) {
      this.page.set(pageNumber);
      this.loadFaQuestions();
      this.scrollToTop();
    }
  }

  goToPrevious(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.loadFaQuestions();
      this.scrollToTop();
    }
  }

  goToNext(): void {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
      this.loadFaQuestions();
      this.scrollToTop();
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  editQuestion(question: FaQuestionInterface): void {
    this.router.navigate(['/fa-questions/edit/', question.id]);
  }

  deleteQuestion(question: FaQuestionInterface): void {
    this.selectedQuestion = question;
    this.deleteDialogVisible = true;
  }

  confirmDelete(): void {
    if (this.selectedQuestion) {
      this.faQuestionService.deleteFaQuestion(this.selectedQuestion.id).subscribe(
        (response: any) => {
          this.faQuestions.set(
            this.faQuestions().filter((q) => q.id !== this.selectedQuestion!.id)
          );
          this.hotToastService.success(
            `FA Question "${
              this.selectedQuestion!.questionEn || this.selectedQuestion!.questionAr
            }" deleted successfully`
          );
          this.deleteDialogVisible = false;
          this.selectedQuestion = null;
          this.cdr.detectChanges();
        },
        (error: any) => {
          this.hotToastService.error('Failed to delete FA Question');
          this.deleteDialogVisible = false;
          this.selectedQuestion = null;
        }
      );
    }
  }

  cancelDelete(): void {
    this.deleteDialogVisible = false;
    this.selectedQuestion = null;
  }

  addQuestion(): void {
    this.router.navigate(['/fa-questions/add']);
  }

  viewQuestion(question: FaQuestionInterface): void {
    this.selectedQuestion = question;
    this.detailsDialogVisible = true;
  }

  closeDetailsDialog(): void {
    this.detailsDialogVisible = false;
    this.selectedQuestion = null;
  }
}
