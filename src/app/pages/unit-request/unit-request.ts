import { Component, signal, ChangeDetectorRef, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import {
  LucideAngularModule,
  Eye,
  Calendar,
  MessageSquare,
  User,
  Home,
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
  UserCheck,
  FileText,
} from 'lucide-angular';
import { UnitRequestService } from '../../services/unit-request.service';
import { HotToastService } from '@ngxpert/hot-toast';

interface UnitRequestItem {
  id: string;
  unitId: string;
  userId: string;
  salesStaffId: string;
  status: number;
  statusMessage: string;
  createdOn: string;
  [key: string]: any;
}

// Status enum mapping
enum RequestStatus {
  Pending = 0,
  InProgress = 1,
  Completed = 2,
  Rejected = 3,
}

@Component({
  selector: 'app-unit-request',
  imports: [CommonModule, FormsModule, DialogModule, LucideAngularModule],
  templateUrl: './unit-request.html',
  styleUrl: './unit-request.css',
})
export class UnitRequest implements OnInit {
  requests = signal<UnitRequestItem[]>([]);
  selectedRequest: UnitRequestItem | null = null;
  detailsDialogVisible = false;
  updateStatusDialogVisible = false;
  deleteDialogVisible = false;
  requestToDelete: UnitRequestItem | null = null;
  deleting = false;
  loading = signal<boolean>(true);

  // Pagination
  page = signal<number>(1);
  totalPages = signal<number>(1);
  itemsPerPage = signal<number>(9);
  totalItems = signal<number>(0);
  hasNextPage = signal<boolean>(false);
  hasPreviousPage = signal<boolean>(false);

  // Update status form
  newStatus: number | null = null;
  statusMessage: string = '';
  updatingStatus = false;

  // Search and Filter
  searchQuery = signal<string>('');
  selectedStatus: number | null = null;
  filterDropdownOpen = signal<boolean>(false);

  // Status options
  statusOptions = [
    { value: 0, label: 'Pending' },
    { value: 1, label: 'In Progress' },
    { value: 2, label: 'Completed' },
    { value: 3, label: 'Rejected' },
  ];

  protected readonly Eye = Eye;
  protected readonly Calendar = Calendar;
  protected readonly MessageSquare = MessageSquare;
  protected readonly User = User;
  protected readonly Home = Home;
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
  protected readonly UserCheck = UserCheck;
  protected readonly FileText = FileText;

  constructor(
    private unitRequestService: UnitRequestService,
    private cdr: ChangeDetectorRef,
    private hotToastService: HotToastService
  ) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading.set(true);
    const currentPage = this.page();

    this.unitRequestService.getUnitRequests(currentPage, this.itemsPerPage()).subscribe({
      next: (response: any) => {
        let data = response.data || [];

        // Apply client-side filtering if needed
        if (this.selectedStatus !== null) {
          data = data.filter((r: UnitRequestItem) => r.status === this.selectedStatus);
        }

        if (this.searchQuery().trim()) {
          const query = this.searchQuery().toLowerCase().trim();
          data = data.filter(
            (r: UnitRequestItem) =>
              r.unitId.toLowerCase().includes(query) ||
              r.userId.toLowerCase().includes(query) ||
              r.salesStaffId.toLowerCase().includes(query) ||
              (r.statusMessage && r.statusMessage.toLowerCase().includes(query))
          );
        }

        this.requests.set(data);
        this.totalPages.set(response.totalPages || 1);
        this.totalItems.set(response.totalCount || 0);
        this.page.set(response.currentPage || currentPage);
        this.hasNextPage.set(response.hasNextPage || false);
        this.hasPreviousPage.set(response.hasPreviousPage || false);
        this.loading.set(false);
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('Error loading unit requests:', error);
        this.hotToastService.error('Failed to load unit requests');
        this.loading.set(false);
        this.cdr.detectChanges();
      },
    });
  }

  viewRequest(request: UnitRequestItem): void {
    this.selectedRequest = request;
    this.detailsDialogVisible = true;
  }

  closeDetailsDialog(): void {
    this.detailsDialogVisible = false;
    this.selectedRequest = null;
  }

  openUpdateStatusDialog(request: UnitRequestItem): void {
    this.selectedRequest = request;
    this.newStatus = request.status;
    this.statusMessage = request.statusMessage || '';
    this.updateStatusDialogVisible = true;
  }

  closeUpdateStatusDialog(): void {
    this.updateStatusDialogVisible = false;
    this.selectedRequest = null;
    this.newStatus = null;
    this.statusMessage = '';
  }

  updateStatus(): void {
    if (!this.selectedRequest || this.newStatus === null) return;

    this.updatingStatus = true;
    this.unitRequestService.updateUnitRequestStatus(this.selectedRequest.id, this.newStatus).subscribe({
      next: () => {
        this.hotToastService.success('Status updated successfully');
        this.closeUpdateStatusDialog();
        this.loadRequests();
        this.updatingStatus = false;
      },
      error: (error) => {
        console.error('Error updating status:', error);
        this.hotToastService.error('Failed to update status');
        this.updatingStatus = false;
      },
    });
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

  getStatusInfo(status: number | null | undefined): { text: string; class: string; icon: any } {
    if (status === null || status === undefined) {
      return {
        text: 'No Status',
        class: 'bg-gray-100 text-gray-800',
        icon: this.AlertCircle,
      };
    }

    switch (status) {
      case RequestStatus.Pending:
        return {
          text: 'Pending',
          class: 'bg-yellow-100 text-yellow-800',
          icon: this.Clock,
        };
      case RequestStatus.InProgress:
        return {
          text: 'In Progress',
          class: 'bg-blue-100 text-blue-800',
          icon: this.AlertCircle,
        };
      case RequestStatus.Completed:
        return {
          text: 'Completed',
          class: 'bg-green-100 text-green-800',
          icon: this.CheckCircle2,
        };
      case RequestStatus.Rejected:
        return {
          text: 'Rejected',
          class: 'bg-red-100 text-red-800',
          icon: this.XCircle,
        };
      default:
        return {
          text: `Status ${status}`,
          class: 'bg-gray-100 text-gray-800',
          icon: this.AlertCircle,
        };
    }
  }

  truncateId(id: string): string {
    if (!id) return 'N/A';
    return id.length > 8 ? id.substring(0, 8) + '...' : id;
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
    this.page.set(1);
    this.loadRequests();
  }

  hasActiveFilters(): boolean {
    return this.searchQuery().trim() !== '' || this.selectedStatus !== null;
  }

  toggleFilterDropdown(): void {
    this.filterDropdownOpen.set(!this.filterDropdownOpen());
  }

  // Delete methods
  confirmDelete(request: UnitRequestItem): void {
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
    this.unitRequestService.deleteUnitRequest(this.requestToDelete.id).subscribe({
      next: () => {
        this.hotToastService.success('Unit request deleted successfully');
        this.closeDeleteDialog();
        this.loadRequests();
        this.deleting = false;

        // Adjust page if current page becomes empty
        if (this.requests().length === 0 && this.page() > 1) {
          this.page.set(this.page() - 1);
          this.loadRequests();
        }
      },
      error: (error) => {
        console.error('Error deleting unit request:', error);
        this.hotToastService.error('Failed to delete unit request');
        this.deleting = false;
      },
    });
  }
}
