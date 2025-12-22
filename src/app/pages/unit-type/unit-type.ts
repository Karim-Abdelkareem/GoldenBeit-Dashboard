import { Component, signal, computed, ChangeDetectorRef } from '@angular/core';
import {
  LucideAngularModule,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Trash2,
  Plus,
  Eye,
  Tag,
} from 'lucide-angular';
import { UnitTypeInterface } from '../../interfaces/unit-type.interface';
import { UnitTypeService } from '../../services/unit-type.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-unit-type',
  imports: [LucideAngularModule, CommonModule, DialogModule],
  templateUrl: './unit-type.html',
  styleUrl: './unit-type.css',
})
export class UnitType {
  unitTypes = signal<UnitTypeInterface[]>([]);
  deleteDialogVisible = false;
  detailsDialogVisible = false;
  selectedUnitType: UnitTypeInterface | null = null;
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
    private unitTypeService: UnitTypeService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private hotToastService: HotToastService
  ) {}

  ngOnInit(): void {
    this.loadUnitTypes();
  }

  loadUnitTypes(): void {
    this.loading.set(true);
    const currentPage = this.page();
    this.unitTypeService.getUnitTypes(currentPage, this.itemsPerPage()).subscribe(
      (response: any) => {
        this.unitTypes.set(response.data || []);
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
        console.error('Error loading unit types:', error);
        this.hotToastService.error('Failed to load unit types');
        this.loading.set(false);
        this.cdr.detectChanges();
      }
    );
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages()) {
      this.page.set(pageNumber);
      this.loadUnitTypes();
      this.scrollToTop();
    }
  }

  goToPrevious(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.loadUnitTypes();
      this.scrollToTop();
    }
  }

  goToNext(): void {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
      this.loadUnitTypes();
      this.scrollToTop();
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  viewDetails(unitType: UnitTypeInterface): void {
    this.selectedUnitType = unitType;
    this.detailsDialogVisible = true;
  }

  closeDetailsDialog(): void {
    this.detailsDialogVisible = false;
    this.selectedUnitType = null;
  }

  editUnitType(unitType: UnitTypeInterface): void {
    this.router.navigate(['/unit-type/edit/', unitType.id]);
  }

  deleteUnitType(unitType: UnitTypeInterface): void {
    this.selectedUnitType = unitType;
    this.deleteDialogVisible = true;
  }

  confirmDelete(): void {
    if (this.selectedUnitType && this.selectedUnitType.id) {
      this.unitTypeService.deleteUnitType(this.selectedUnitType.id).subscribe(
        (response: any) => {
          this.unitTypes.set(
            this.unitTypes().filter((u) => u.id !== this.selectedUnitType!.id)
          );
          this.hotToastService.success(
            `Unit type "${this.selectedUnitType!.nameEn || this.selectedUnitType!.nameAr}" deleted successfully`
          );
          this.deleteDialogVisible = false;
          this.selectedUnitType = null;
          this.cdr.detectChanges();
        },
        (error: any) => {
          this.hotToastService.error('Failed to delete unit type');
          this.deleteDialogVisible = false;
          this.selectedUnitType = null;
        }
      );
    }
  }

  cancelDelete(): void {
    this.deleteDialogVisible = false;
    this.selectedUnitType = null;
  }

  addUnitType(): void {
    this.router.navigate(['/unit-type/add']);
  }
}
