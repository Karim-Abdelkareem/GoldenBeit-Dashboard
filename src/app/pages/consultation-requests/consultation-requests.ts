import { Component, signal, ChangeDetectorRef, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { DialogModule } from 'primeng/dialog';
import {
  LucideAngularModule,
  Eye,
  Calendar,
  MessageSquare,
  User,
  Briefcase,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Send,
  ChevronLeft,
  ChevronRight,
  Search,
  Filter,
  X,
  Trash2,
} from 'lucide-angular';
import { ConsultationService } from '../../services/consultation.service';
import { HotToastService } from '@ngxpert/hot-toast';

interface ConsultationRequest {
  id: string;
  consultationId: string;
  userId: string;
  consultativeId?: string | null;
  status?: string | null;
  staffMsg?: string | null;
  consultationNameAr: string;
  consultationNameEn: string;
  createdOn: string;
  [key: string]: any;
}

// Status enum
enum RequestStatus {
  Pending = 'Pending',
  InProgress = 'InProgress',
  Completed = 'Completed',
  Rejected = 'Rejected',
}

@Component({
  selector: 'app-consultation-requests',
  imports: [CommonModule, FormsModule, TableModule, DialogModule, LucideAngularModule],
  templateUrl: './consultation-requests.html',
  styleUrl: './consultation-requests.css',
})
export class ConsultationRequests implements OnInit {
  requests = signal<ConsultationRequest[]>([]);
  selectedRequest: ConsultationRequest | null = null;
  detailsDialogVisible = false;
  updateStatusDialogVisible = false;
  deleteDialogVisible = false;
  requestToDelete: ConsultationRequest | null = null;
  deleting = false;
  loading = signal<boolean>(true);

  // Pagination
  page = signal<number>(1);
  totalPages = signal<number>(1);
  itemsPerPage = signal<number>(10);
  totalItems = signal<number>(0);
  hasNextPage = signal<boolean>(false);
  hasPreviousPage = signal<boolean>(false);

  // Update status form
  newStatus: string | null = null;
  staffMessage: string = '';
  updatingStatus = false;

  // Search and Filter
  searchQuery = signal<string>('');
  selectedStatus: string | null = null;
  selectedConsultationId: string | null = null;
  filterDropdownOpen = signal<boolean>(false);
  consultations = signal<Array<{ id: string; nameEn: string; nameAr: string }>>([]);
  loadingConsultations = signal<boolean>(false);

  protected readonly Eye = Eye;
  protected readonly Calendar = Calendar;
  protected readonly MessageSquare = MessageSquare;
  protected readonly User = User;
  protected readonly Briefcase = Briefcase;
  protected readonly Clock = Clock;
  protected readonly CheckCircle2 = CheckCircle2;
  protected readonly XCircle = XCircle;
  protected readonly AlertCircle = AlertCircle;
  protected readonly Send = Send;
  protected readonly ChevronLeft = ChevronLeft;
  protected readonly ChevronRight = ChevronRight;
  protected readonly Search = Search;
  protected readonly Filter = Filter;
  protected readonly X = X;
  protected readonly Trash2 = Trash2;

  constructor(
    private consultationService: ConsultationService,
    private cdr: ChangeDetectorRef,
    private hotToastService: HotToastService
  ) {}

  ngOnInit(): void {
    this.loadConsultations();
    this.loadRequests();
  }

  loadConsultations(): void {
    this.loadingConsultations.set(true);
    this.consultationService.getAllConsultations().subscribe(
      (response: any) => {
        const consultations = response.data || [];
        this.consultations.set(
          consultations.map((c: any) => ({
            id: c.id,
            nameEn: c.nameEn || '',
            nameAr: c.nameAr || '',
          }))
        );
        this.loadingConsultations.set(false);
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error loading consultations:', error);
        this.loadingConsultations.set(false);
        this.cdr.detectChanges();
      }
    );
  }

  loadRequests(): void {
    this.loading.set(true);
    const currentPage = this.page();

    const filters: any = {};

    // Add search query
    if (this.searchQuery().trim()) {
      filters.searchQuery = this.searchQuery().trim();
    }

    // Add filters
    if (this.selectedStatus) {
      filters.status = this.selectedStatus;
    }

    if (this.selectedConsultationId) {
      filters.consultationId = this.selectedConsultationId;
    }

    this.consultationService.getConsultationRequests(currentPage, this.itemsPerPage(), filters).subscribe(
      (response: any) => {
        this.requests.set(response.data || []);
        this.totalPages.set(response.totalPages || 1);
        this.totalItems.set(response.totalCount || 0);
        this.page.set(response.currentPage || currentPage);
        this.hasNextPage.set(response.hasNextPage || false);
        this.hasPreviousPage.set(response.hasPreviousPage || false);
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      (error) => {
        console.error('Error loading consultation requests:', error);
        this.hotToastService.error('Failed to load consultation requests');
        this.loading.set(false);
        this.cdr.detectChanges();
      }
    );
  }

  viewRequest(request: ConsultationRequest): void {
    this.selectedRequest = request;
    this.detailsDialogVisible = true;
  }

  closeDetailsDialog(): void {
    this.detailsDialogVisible = false;
    this.selectedRequest = null;
  }

  openUpdateStatusDialog(request: ConsultationRequest): void {
    this.selectedRequest = request;
    this.newStatus = request.status || null;
    this.staffMessage = request.staffMsg || '';
    this.updateStatusDialogVisible = true;
  }

  closeUpdateStatusDialog(): void {
    this.updateStatusDialogVisible = false;
    this.selectedRequest = null;
    this.newStatus = null;
    this.staffMessage = '';
  }

  updateStatus(): void {
    if (!this.selectedRequest || !this.newStatus) return;

    this.updatingStatus = true;
    this.consultationService
      .updateConsultationRequestStatus(
        this.selectedRequest.id,
        this.selectedRequest.consultationId,
        this.selectedRequest.consultativeId,
        this.newStatus,
        this.staffMessage || undefined
      )
      .subscribe(
        () => {
          this.hotToastService.success('Status updated successfully');
          this.closeUpdateStatusDialog();
          this.loadRequests();
          this.updatingStatus = false;
        },
        (error) => {
          console.error('Error updating status:', error);
          this.hotToastService.error('Failed to update status');
          this.updatingStatus = false;
        }
      );
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return dateString;
    }
  }

  getStatusInfo(status: string | null | undefined): { text: string; class: string; icon: any } {
    if (!status) {
      return {
        text: 'No Status',
        class: 'bg-gray-100 text-gray-800',
        icon: this.AlertCircle,
      };
    }

    switch (status) {
      case RequestStatus.Pending:
      case 'Pending':
        return {
          text: 'Pending',
          class: 'bg-yellow-100 text-yellow-800',
          icon: this.Clock,
        };
      case RequestStatus.InProgress:
      case 'InProgress':
        return {
          text: 'In Progress',
          class: 'bg-blue-100 text-blue-800',
          icon: this.AlertCircle,
        };
      case RequestStatus.Completed:
      case 'Completed':
        return {
          text: 'Completed',
          class: 'bg-green-100 text-green-800',
          icon: this.CheckCircle2,
        };
      case RequestStatus.Rejected:
      case 'Rejected':
        return {
          text: 'Rejected',
          class: 'bg-red-100 text-red-800',
          icon: this.XCircle,
        };
      default:
        return {
          text: status,
          class: 'bg-gray-100 text-gray-800',
          icon: this.AlertCircle,
        };
    }
  }

  // Pagination methods
  goToPage(pageNum: number): void {
    if (pageNum >= 1 && pageNum <= this.totalPages()) {
      this.page.set(pageNum);
      this.loadRequests();
    }
  }

  nextPage(): void {
    if (this.hasNextPage()) {
      this.page.set(this.page() + 1);
      this.loadRequests();
    }
  }

  previousPage(): void {
    if (this.hasPreviousPage()) {
      this.page.set(this.page() - 1);
      this.loadRequests();
    }
  }

  getVisiblePages(): number[] {
    const current = this.page();
    const total = this.totalPages();
    const pages: number[] = [];

    if (total <= 5) {
      for (let i = 1; i <= total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        for (let i = 1; i <= 5; i++) {
          pages.push(i);
        }
      } else if (current >= total - 2) {
        for (let i = total - 4; i <= total; i++) {
          pages.push(i);
        }
      } else {
        for (let i = current - 2; i <= current + 2; i++) {
          pages.push(i);
        }
      }
    }

    return pages;
  }

  // Search and Filter methods
  onSearch(): void {
    this.page.set(1);
    this.loadRequests();
  }

  onFilterChange(): void {
    this.page.set(1);
    this.loadRequests();
  }

  clearFilters(): void {
    this.searchQuery.set('');
    this.selectedStatus = null;
    this.selectedConsultationId = null;
    this.page.set(1);
    this.loadRequests();
  }

  hasActiveFilters(): boolean {
    return (
      this.searchQuery().trim() !== '' ||
      this.selectedStatus !== null ||
      this.selectedConsultationId !== null
    );
  }

  getConsultationName(consultationId: string | null): string {
    if (!consultationId) return '';
    const consultation = this.consultations().find((c) => c.id === consultationId);
    return consultation ? consultation.nameEn : consultationId.substring(0, 8) + '...';
  }

  toggleFilterDropdown(): void {
    this.filterDropdownOpen.set(!this.filterDropdownOpen());
  }

  onDocumentClick(event: Event): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.filter-dropdown-container')) {
      this.filterDropdownOpen.set(false);
    }
  }

  // Delete methods
  confirmDelete(request: ConsultationRequest): void {
    this.requestToDelete = request;
    this.deleteDialogVisible = true;
  }

  closeDeleteDialog(): void {
    this.deleteDialogVisible = false;
    this.requestToDelete = null;
  }

  deleteRequest(): void {
    if (!this.requestToDelete) return;

    this.deleting = true;
    this.consultationService.deleteConsultationRequest(this.requestToDelete.id).subscribe(
      () => {
        this.hotToastService.success('Consultation request deleted successfully');
        this.closeDeleteDialog();
        this.loadRequests();
        this.deleting = false;

        // Adjust page if current page becomes empty
        if (this.requests().length === 0 && this.page() > 1) {
          this.page.set(this.page() - 1);
          this.loadRequests();
        }
      },
      (error) => {
        console.error('Error deleting consultation request:', error);
        this.hotToastService.error('Failed to delete consultation request');
        this.deleting = false;
      }
    );
  }
}
