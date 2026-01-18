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
  MapPin,
  Image as ImageIcon,
} from 'lucide-angular';
import { StageInterface } from '../../interfaces/stage.interface';
import { StagesService } from '../../services/stages.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { HotToastService } from '@ngxpert/hot-toast';
import { environment } from '../../environment/environment';

interface CityInfo {
  id: string;
  stageId: string;
  cityId: string;
  stageNameAr: string;
  stageNameEn: string;
  cityNameAr: string;
  cityNameEn: string;
}

interface Stage extends StageInterface {
  projectNameAr?: string;
  projectNameEn?: string;
  cities?: CityInfo[];
  cityNames?: string[];
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
  protected readonly MapPin = MapPin;
  protected readonly ImageIcon = ImageIcon;
  protected readonly imageUrl = environment.imageUrl;

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

  getCityNames(stage: Stage | null): string[] {
    if (!stage) return [];

    // First try to use cityNames if available
    if (stage.cityNames && stage.cityNames.length > 0) {
      return stage.cityNames;
    }

    // Otherwise, extract from cities array
    if (stage.cities && stage.cities.length > 0) {
      return stage.cities.map((city) => city.cityNameEn || city.cityNameAr || 'Unknown City');
    }

    return [];
  }

  loadStages(): void {
    this.loading.set(true);
    const requestedPage = this.page();
    this.stagesService.getStages(requestedPage, this.itemsPerPage()).subscribe(
      (response: any) => {
        const stagesData = (response.data || []).map((stage: any) => {
          // Extract city names from cities array if available
          if (stage.cities && Array.isArray(stage.cities) && stage.cities.length > 0) {
            stage.cityNames = stage.cities.map(
              (city: CityInfo) => city.cityNameEn || city.cityNameAr || 'Unknown City'
            );
            // Extract cityIds from cities array if not already present
            if (!stage.cityIds || stage.cityIds.length === 0) {
              stage.cityIds = stage.cities.map((city: CityInfo) => city.cityId);
            }
          }
          return stage;
        });
        this.stages.set(stagesData);
        this.totalPages.set(response.totalPages || 1);
        this.totalItems.set(response.totalCount || 0);
        this.page.set(response.currentPage || requestedPage); // Use response's currentPage
        this.hasNextPage.set(response.hasNextPage || false);
        this.hasPreviousPage.set(response.hasPreviousPage || false);

        const totalPages = response.totalPages || 1;
        const currentPage = response.currentPage || requestedPage;
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
          this.hotToastService.success(
            `Stage "${
              this.selectedStage!.nameEn || this.selectedStage!.nameAr
            }" deleted successfully`
          );
          this.deleteDialogVisible = false;
          this.selectedStage = null;

          // Check if current page will be empty after deletion
          const remainingItems = this.stages().length - 1;
          if (remainingItems === 0 && this.page() > 1) {
            // Go to previous page if current page will be empty
            this.page.set(this.page() - 1);
          }

          // Reload stages to update pagination
          this.loadStages();
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

  getImageUrl(imagePath?: string): string {
    if (!imagePath) {
      return '/blog/3.jpg'; // Default fallback image
    }
    // If imagePath is already a data URL (starts with "data:image/"), return as is
    if (imagePath.startsWith('data:image/')) {
      return imagePath;
    }
    // If imagePath already starts with http, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Otherwise, prepend the base URL
    return `${this.imageUrl}${imagePath}`;
  }
}
