import { ChangeDetectorRef, Component, signal, computed } from '@angular/core';
import { CityInterface } from '../../interfaces/city.interface';
import { CityService } from '../../services/city.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import {
  LucideAngularModule,
  Pencil,
  Trash2,
  Plus,
  ChevronLeft,
  ChevronRight,
} from 'lucide-angular';

@Component({
  selector: 'app-city',
  imports: [CommonModule, DialogModule, LucideAngularModule],
  templateUrl: './city.html',
  styleUrl: './city.css',
})
export class City {
  cities = signal<CityInterface[]>([]);
  deleteDialogVisible = false;
  selectedCity: CityInterface | null = null;
  page = signal<number>(1);
  totalPages = signal<number>(1);
  itemsPerPage = signal<number>(9);
  totalItems = signal<number>(0);
  hasNextPage = signal<boolean>(false);
  hasPreviousPage = signal<boolean>(false);
  showStartEllipsis = signal<boolean>(false);
  showEndEllipsis = signal<boolean>(false);
  protected readonly Pencil = Pencil;
  protected readonly Trash2 = Trash2;
  protected readonly Plus = Plus;
  protected readonly ChevronLeft = ChevronLeft;
  protected readonly ChevronRight = ChevronRight;

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
    private cityService: CityService,
    private hotToastService: HotToastService,
    private cdr: ChangeDetectorRef,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCities();
  }

  loadCities(): void {
    const currentPage = this.page();
    this.cityService.getCities(currentPage, this.itemsPerPage()).subscribe(
      (response: any) => {
        this.cities.set(response.data || []);
        this.totalPages.set(response.totalPages || 1);
        this.totalItems.set(response.totalCount || 0);
        // Use the page we requested, not the response (API might return 0-based or 1-based)
        this.page.set(currentPage);
        this.hasNextPage.set(response.hasNextPage || false);
        this.hasPreviousPage.set(response.hasPreviousPage || false);

        // Calculate ellipsis based on current page and total pages
        const totalPages = response.totalPages || 1;
        this.showStartEllipsis.set(currentPage > 3);
        this.showEndEllipsis.set(currentPage < totalPages - 2);

        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error loading cities:', error);
        this.hotToastService.error('Failed to get cities');
        this.cdr.detectChanges();
      }
    );
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages()) {
      this.page.set(pageNumber);
      this.loadCities();
      this.scrollToTop();
    } else {
      console.warn('Invalid page number:', pageNumber);
    }
  }

  goToPrevious(): void {
    const currentPage = this.page();
    if (currentPage > 1) {
      const newPage = currentPage - 1;
      this.page.set(newPage);
      this.loadCities();
      this.scrollToTop();
    } else {
      console.warn('Cannot go to previous page. Already on page 1');
    }
  }

  goToNext(): void {
    const currentPage = this.page();
    const totalPages = this.totalPages();
    if (currentPage < totalPages) {
      const newPage = currentPage + 1;
      this.page.set(newPage);
      this.loadCities();
      this.scrollToTop();
    } else {
      console.warn('Cannot go to next page. Already on last page');
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  editCity(city: CityInterface): void {
    this.router.navigate(['/city/edit/', city.id]);
  }

  deleteCity(city: CityInterface): void {
    this.selectedCity = city;
    this.deleteDialogVisible = true;
  }

  confirmDelete(): void {
    if (this.selectedCity) {
      this.cityService.deleteCity(this.selectedCity.id).subscribe(
        (response: any) => {
          this.hotToastService.success(`City "${this.selectedCity!.nameEn}" deleted successfully`);
          this.deleteDialogVisible = false;
          const deletedCity = this.selectedCity;
          this.selectedCity = null;

          // If current page becomes empty and not on first page, go to previous page
          const currentCities = this.cities().filter((c) => c.id !== deletedCity!.id);
          if (currentCities.length === 0 && this.page() > 1) {
            this.page.set(this.page() - 1);
          }

          // Reload cities to get updated pagination data
          this.loadCities();
        },
        (error: any) => {
          this.hotToastService.error('Failed to delete city');
          this.deleteDialogVisible = false;
          this.selectedCity = null;
        }
      );
    }
  }

  cancelDelete(): void {
    this.deleteDialogVisible = false;
    this.selectedCity = null;
  }

  addCity(): void {
    this.router.navigate(['/city/add']);
  }
}
