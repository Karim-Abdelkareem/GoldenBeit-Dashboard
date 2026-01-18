import { Component, signal, computed, ChangeDetectorRef, CUSTOM_ELEMENTS_SCHEMA, HostListener } from '@angular/core';
import {
  LucideAngularModule,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Trash2,
  Eye,
  MapPin,
  Home,
  DollarSign,
  Ruler,
  Building2,
  Phone,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  X,
} from 'lucide-angular';
import { EstateunitService } from '../../services/estateunit.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { HotToastService } from '@ngxpert/hot-toast';
import { EstateUnit as EstateUnitInterface, UnitImage } from '../../interfaces/estate-unit.interface';
import { environment } from '../../environment/environment';
import { FormsModule } from '@angular/forms';
import { CityService } from '../../services/city.service';

@Component({
  selector: 'app-estate-unit',
  imports: [LucideAngularModule, CommonModule, DialogModule, FormsModule],
  templateUrl: './estate-unit.html',
  styleUrl: './estate-unit.css',
  schemas: [CUSTOM_ELEMENTS_SCHEMA],
})
export class EstateUnit {
  estateUnits = signal<EstateUnitInterface[]>([]);
  deleteDialogVisible = false;
  detailsDialogVisible = false;
  selectedUnit: EstateUnitInterface | null = null;
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
  protected readonly ChevronLeft = ChevronLeft;
  protected readonly ChevronRight = ChevronRight;
  protected readonly Eye = Eye;
  protected readonly MapPin = MapPin;
  protected readonly Home = Home;
  protected readonly DollarSign = DollarSign;
  protected readonly Ruler = Ruler;
  protected readonly Building2 = Building2;
  protected readonly Phone = Phone;
  protected readonly CheckCircle2 = CheckCircle2;
  protected readonly XCircle = XCircle;
  protected readonly Search = Search;
  protected readonly Filter = Filter;
  protected readonly X = X;
  url = environment.imageUrl;

  // Search and Filter (using regular properties for ngModel binding)
  searchQuery = signal<string>('');
  selectedStatus: number | null = null;
  selectedCityId: string | null = null;
  minPrice: number | null = null;
  maxPrice: number | null = null;
  filterDropdownOpen = signal<boolean>(false);
  cities = signal<Array<{ id: string; nameEn: string; nameAr: string }>>([]);
  loadingCities = signal<boolean>(false);

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
    private estateUnitService: EstateunitService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private hotToastService: HotToastService,
    private cityService: CityService
  ) {}

  ngOnInit(): void {
    this.loadCities();
    this.loadEstateUnits();
  }

  loadEstateUnits(): void {
    this.loading.set(true);
    const currentPage = this.page();
    const searchParams: any = {
      pageNumber: currentPage,
      pageSize: this.itemsPerPage(),
      orderBy: ['createdOn desc'],
    };

    // Add search query (will be converted to advancedSearch in service)
    if (this.searchQuery().trim()) {
      searchParams.searchQuery = this.searchQuery().trim();
    }

    // Add filters
    if (this.selectedStatus !== null && this.selectedStatus !== undefined) {
      searchParams.status = Number(this.selectedStatus); // 0, 1, 2, 3, 4
    }

    if (this.selectedCityId) {
      searchParams.cityId = this.selectedCityId;
    }

    if (this.minPrice !== null && this.minPrice !== undefined) {
      searchParams.minPrice = Number(this.minPrice);
    }

    if (this.maxPrice !== null && this.maxPrice !== undefined) {
      searchParams.maxPrice = Number(this.maxPrice);
    }

    this.estateUnitService.getEstateUnits(currentPage, this.itemsPerPage(), searchParams).subscribe(
      (response: any) => {
        this.estateUnits.set(response.data || []);
        console.log(this.estateUnits());
        
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
        console.error('Error loading estate units:', error);
        this.hotToastService.error('Failed to load estate units');
        this.loading.set(false);
        this.cdr.detectChanges();
      }
    );
  }

  loadCities(): void {
    this.loadingCities.set(true);
    this.cityService.getCities(1, 1000).subscribe(
      (response: any) => {
        const citiesList = response.data || [];
        this.cities.set(
          citiesList.map((city: any) => ({
            id: city.id,
            nameEn: city.nameEn || city.nameAr || 'Untitled City',
            nameAr: city.nameAr || city.nameEn || 'مدينة بدون عنوان',
          }))
        );
        this.loadingCities.set(false);
        this.cdr.detectChanges();
      },
      (error: any) => {
        console.error('Error loading cities:', error);
        this.loadingCities.set(false);
        this.cdr.detectChanges();
      }
    );
  }

  onSearch(): void {
    this.page.set(1);
    this.loadEstateUnits();
  }

  onFilterChange(): void {
    this.page.set(1);
    this.loadEstateUnits();
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus = null;
    this.selectedCityId = null;
    this.minPrice = null;
    this.maxPrice = null;
    this.page.set(1);
    this.loadEstateUnits();
  }

  toggleFilterDropdown(): void {
    this.filterDropdownOpen.set(!this.filterDropdownOpen());
  }

  hasActiveFilters(): boolean {
    return (
      this.searchQuery().trim() !== '' ||
      this.selectedStatus !== null ||
      this.selectedCityId !== null ||
      this.minPrice !== null ||
      this.maxPrice !== null
    );
  }

  getCityName(cityId: string | null): string {
    if (!cityId) return '';
    const city = this.cities().find((c) => c.id === cityId);
    return city?.nameEn || '';
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages()) {
      this.page.set(pageNumber);
      this.loadEstateUnits();
      this.scrollToTop();
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.filter-dropdown-container')) {
      this.filterDropdownOpen.set(false);
    }
  }

  goToPrevious(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.loadEstateUnits();
      this.scrollToTop();
    }
  }

  goToNext(): void {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
      this.loadEstateUnits();
      this.scrollToTop();
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  viewDetails(unit: EstateUnitInterface): void {
    this.router.navigate(['/estate-units/details/', unit.id]);
  }

  closeDetailsDialog(): void {
    this.detailsDialogVisible = false;
    this.selectedUnit = null;
  }

  editUnit(unit: EstateUnitInterface): void {
    this.router.navigate(['/estate-units/edit/', unit.id]);
  }

  deleteUnit(unit: EstateUnitInterface): void {
    this.selectedUnit = unit;
    this.deleteDialogVisible = true;
  }

  confirmDelete(): void {
    if (this.selectedUnit) {
      this.estateUnitService.deleteEstateUnit(this.selectedUnit.id).subscribe(
        (response: any) => {
          this.estateUnits.set(this.estateUnits().filter((u) => u.id !== this.selectedUnit!.id));
          this.hotToastService.success(
            `Estate unit "${
              this.selectedUnit!.titleEn || this.selectedUnit!.unitNumber
            }" deleted successfully`
          );
          this.deleteDialogVisible = false;
          this.selectedUnit = null;
          this.cdr.detectChanges();
        },
        (error: any) => {
          this.hotToastService.error('Failed to delete estate unit');
          this.deleteDialogVisible = false;
          this.selectedUnit = null;
        }
      );
    }
  }

  cancelDelete(): void {
    this.deleteDialogVisible = false;
    this.selectedUnit = null;
  }

  formatPrice(price?: number, currency?: number): string {
    if (price === undefined || price === null) return 'N/A';
    const formattedPrice = new Intl.NumberFormat('en-US').format(price);
    const currencySymbol = this.getCurrencySymbol(currency);
    return `${formattedPrice} ${currencySymbol}`;
  }

  getCurrencySymbol(currency?: number): string {
    // Assuming: 0 = EGP, 1 = USD, 2 = EUR, etc.
    const currencies: { [key: number]: string } = {
      0: 'EGP',
      1: 'USD',
      2: 'EUR',
    };
    return currencies[currency ?? 0] || 'EGP';
  }

  getStatusBadge(status?: number): { text: string; class: string } {
    // Status enum: 0=PendingApproval, 1=Rejected, 2=Available, 3=Requested, 4=Sold
    const statuses: { [key: number]: { text: string; class: string } } = {
      0: { text: 'Pending Approval', class: 'bg-yellow-100 text-yellow-800' },
      1: { text: 'Rejected', class: 'bg-red-100 text-red-800' },
      2: { text: 'Available', class: 'bg-green-100 text-green-800' },
      3: { text: 'Requested', class: 'bg-blue-100 text-blue-800' },
      4: { text: 'Sold', class: 'bg-gray-100 text-gray-800' },
    };
    return statuses[status ?? 2] || { text: 'Unknown', class: 'bg-gray-100 text-gray-800' };
  }

  formatArea(area?: number): string {
    if (area === undefined || area === null) return 'N/A';
    return `${new Intl.NumberFormat('en-US').format(area)} m²`;
  }

  getImageUrl(unit: EstateUnitInterface): string {
    // First check if there are images in the array
    const images = this.getValidImages(unit);
    if (images.length > 0 && images[0].imagePath) {
      return this.getImageUrlFromPath(images[0].imagePath);
    }
    // Fallback to single imagePath property
    const imagePath = (unit as any).imagePath;
    if (!imagePath) {
      return '/blog/3.jpg'; // Default fallback image
    }
    return this.getImageUrlFromPath(imagePath);
  }

  getValidImages(unit: EstateUnitInterface): UnitImage[] {
    if (!unit.images || !Array.isArray(unit.images)) {
      return [];
    }
    return unit.images.filter((img) => img.imagePath && img.imagePath.trim() !== '');
  }

  getImageUrlFromPath(imagePath: string): string {
    if (!imagePath) {
      return '/blog/3.jpg'; // Default fallback image
    }
    // If imagePath already starts with http, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Otherwise, prepend the base URL
    return `${this.url}${imagePath}`;
  }
}
