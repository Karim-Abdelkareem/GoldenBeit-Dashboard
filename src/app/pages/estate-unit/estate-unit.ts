import { Component, signal, computed, ChangeDetectorRef } from '@angular/core';
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
} from 'lucide-angular';
import { EstateunitService } from '../../services/estateunit.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { HotToastService } from '@ngxpert/hot-toast';
import { EstateUnit as EstateUnitInterface } from '../../interfaces/estate-unit.interface';

@Component({
  selector: 'app-estate-unit',
  imports: [LucideAngularModule, CommonModule, DialogModule],
  templateUrl: './estate-unit.html',
  styleUrl: './estate-unit.css',
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
    private hotToastService: HotToastService
  ) {}

  ngOnInit(): void {
    this.loadEstateUnits();
  }

  loadEstateUnits(): void {
    this.loading.set(true);
    const currentPage = this.page();
    this.estateUnitService.getEstateUnits(currentPage, this.itemsPerPage()).subscribe(
      (response: any) => {
        this.estateUnits.set(response.data || []);
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

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages()) {
      this.page.set(pageNumber);
      this.loadEstateUnits();
      this.scrollToTop();
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
    this.selectedUnit = unit;
    this.detailsDialogVisible = true;
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
    // Assuming status enum values
    const statuses: { [key: number]: { text: string; class: string } } = {
      0: { text: 'Available', class: 'bg-green-100 text-green-800' },
      1: { text: 'Sold', class: 'bg-red-100 text-red-800' },
      2: { text: 'Reserved', class: 'bg-yellow-100 text-yellow-800' },
      3: { text: 'Pending', class: 'bg-gray-100 text-gray-800' },
    };
    return statuses[status ?? 0] || { text: 'Unknown', class: 'bg-gray-100 text-gray-800' };
  }

  formatArea(area?: number): string {
    if (area === undefined || area === null) return 'N/A';
    return `${new Intl.NumberFormat('en-US').format(area)} m²`;
  }
}
