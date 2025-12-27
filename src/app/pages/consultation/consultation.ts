import { Component, signal, computed, ChangeDetectorRef, OnInit } from '@angular/core';
import {
  LucideAngularModule,
  ChevronRight,
  ChevronLeft,
  MoveUpLeft,
  Pencil,
  Trash2,
  Plus,
} from 'lucide-angular';
import { ConsultationService } from '../../services/consultation.service';
import { CommonModule, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { HotToastService } from '@ngxpert/hot-toast';
import { environment } from '../../environment/environment';
import { ConsultationResponseData, ConsultationData } from '../../interfaces/cosultation.interface';

@Component({
  selector: 'app-consultation',
  imports: [LucideAngularModule, CommonModule, DialogModule, DatePipe],
  templateUrl: './consultation.html',
  styleUrl: './consultation.css',
})
export class Consultation implements OnInit {
  protected readonly ChevronRight = ChevronRight;
  protected readonly ChevronLeft = ChevronLeft;
  protected readonly MoveUpLeft = MoveUpLeft;
  protected readonly Pencil = Pencil;
  protected readonly Trash2 = Trash2;
  protected readonly Plus = Plus;
  url = environment.imageUrl;
  consultations = signal<ConsultationData[]>([]);
  today = new Date();
  page = signal<number>(1);
  totalPages = signal<number>(0);
  itemsPerPage = signal<number>(9);
  totalItems = signal<number>(0);
  hasNextPage = signal<boolean>(false);
  hasPreviousPage = signal<boolean>(false);
  showStartEllipsis = signal<boolean>(false);
  showEndEllipsis = signal<boolean>(false);
  deleteDialogVisible = false;
  selectedConsultation: ConsultationData | null = null;

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

  constructor(
    private consultationService: ConsultationService,
    private cdr: ChangeDetectorRef,
    protected router: Router,
    private hotToastService: HotToastService
  ) {}

  ngOnInit(): void {
    this.loadConsultations();
  }

  loadConsultations(): void {
    this.consultationService.getConsultations(this.page(), this.itemsPerPage()).subscribe(
      (response: any) => {
        this.consultations.set(response.data);
        this.totalPages.set(response.totalPages);
        this.totalItems.set(response.totalCount);
        const currentPage = response.currentPage + 1; // API returns 0-based, we use 1-based
        this.page.set(currentPage);
        this.hasNextPage.set(response.hasNextPage);
        this.hasPreviousPage.set(response.hasPreviousPage);

        // Calculate ellipsis visibility
        const total = response.totalPages;
        this.showStartEllipsis.set(currentPage > 3);
        this.showEndEllipsis.set(currentPage < total - 2);

        this.cdr.detectChanges();
      },
      (error: any) => {
        this.hotToastService.error('Failed to load consultations');
      }
    );
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages()) {
      this.page.set(pageNumber);
      this.loadConsultations();
    }
  }

  goToPrevious(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.loadConsultations();
    }
  }

  goToNext(): void {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
      this.loadConsultations();
    }
  }

  editConsultation(consultation: ConsultationData): void {
    this.router.navigate(['/consultations/edit/', consultation.id]);
  }

  deleteConsultation(consultation: ConsultationData): void {
    this.selectedConsultation = consultation;
    this.deleteDialogVisible = true;
  }

  confirmDelete(): void {
    if (this.selectedConsultation) {
      this.consultationService.deleteConsultation(this.selectedConsultation.id).subscribe(
        (response: any) => {
          this.consultations.set(
            this.consultations().filter((c) => c.id !== this.selectedConsultation!.id)
          );
          this.hotToastService.success(
            `Consultation "${this.selectedConsultation!.nameEn}" deleted successfully`
          );
          this.deleteDialogVisible = false;
          this.selectedConsultation = null;
          this.cdr.detectChanges();
        },
        (error: any) => {
          this.hotToastService.error('Failed to delete consultation');
          this.deleteDialogVisible = false;
          this.selectedConsultation = null;
        }
      );
    }
  }

  cancelDelete(): void {
    this.deleteDialogVisible = false;
    this.selectedConsultation = null;
  }

  consultationDetails(consultation: ConsultationData): void {
    this.router.navigate(['/consultations/details/', consultation.id]);
  }
}
