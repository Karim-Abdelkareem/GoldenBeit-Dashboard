import { Component, signal, computed, ChangeDetectorRef } from '@angular/core';
import {
  LucideAngularModule,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Trash2,
  Plus,
  Eye,
  Calendar,
  Building2,
} from 'lucide-angular';
import { StageInterface } from '../../interfaces/stage.interface';
import { StagesService } from '../../services/stages.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { HotToastService } from '@ngxpert/hot-toast';

interface Stage extends StageInterface {
  projectNameAr?: string;
  projectNameEn?: string;
}

@Component({
  selector: 'app-stages',
  imports: [LucideAngularModule, CommonModule, DialogModule],
  templateUrl: './stages.html',
  styleUrl: './stages.css',
})
export class Stages {
  stages = signal<Stage[]>([]);
  deleteDialogVisible = false;
  detailsDialogVisible = false;
  selectedStage: Stage | null = null;
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
  protected readonly Calendar = Calendar;
  protected readonly Building2 = Building2;

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
    private stagesService: StagesService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private hotToastService: HotToastService
  ) {}

  ngOnInit(): void {
    this.loadStages();
  }

  loadStages(): void {
    this.loading.set(true);
    const currentPage = this.page();
    this.stagesService.getStages(currentPage, this.itemsPerPage()).subscribe(
      (response: any) => {
        this.stages.set(response.data || []);
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
        console.error('Error loading stages:', error);
        this.hotToastService.error('Failed to load stages');
        this.loading.set(false);
        this.cdr.detectChanges();
      }
    );
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages()) {
      this.page.set(pageNumber);
      this.loadStages();
      this.scrollToTop();
    }
  }

  goToPrevious(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.loadStages();
      this.scrollToTop();
    }
  }

  goToNext(): void {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
      this.loadStages();
      this.scrollToTop();
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  viewDetails(stage: Stage): void {
    this.selectedStage = stage;
    this.detailsDialogVisible = true;
  }

  closeDetailsDialog(): void {
    this.detailsDialogVisible = false;
    this.selectedStage = null;
  }

  editStage(stage: Stage): void {
    this.router.navigate(['/stage/edit/', stage.id]);
  }

  deleteStage(stage: Stage): void {
    this.selectedStage = stage;
    this.deleteDialogVisible = true;
  }

  confirmDelete(): void {
    if (this.selectedStage && this.selectedStage.id) {
      this.stagesService.deleteStage(this.selectedStage.id).subscribe(
        (response: any) => {
          this.stages.set(this.stages().filter((s) => s.id !== this.selectedStage!.id));
          this.hotToastService.success(
            `Stage "${
              this.selectedStage!.nameEn || this.selectedStage!.nameAr
            }" deleted successfully`
          );
          this.deleteDialogVisible = false;
          this.selectedStage = null;
          this.cdr.detectChanges();
        },
        (error: any) => {
          this.hotToastService.error('Failed to delete stage');
          this.deleteDialogVisible = false;
          this.selectedStage = null;
        }
      );
    }
  }

  cancelDelete(): void {
    this.deleteDialogVisible = false;
    this.selectedStage = null;
  }

  addStage(): void {
    this.router.navigate(['/stage/add']);
  }
}
