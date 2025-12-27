import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { HotToastService } from '@ngxpert/hot-toast';
import { LucideAngularModule, Pencil, Trash2, Plus, Eye, Search, X, Check } from 'lucide-angular';
import { FormsModule } from '@angular/forms';
import { UserInterface } from '../../interfaces/user.interface';
import { UserService } from '../../services/user.service';
import { environment } from '../../environment/environment';

@Component({
  selector: 'app-users',
  imports: [
    CommonModule,
    TableModule,
    ButtonModule,
    DialogModule,
    LucideAngularModule,
    FormsModule,
  ],
  templateUrl: './users.html',
  styleUrl: './users.css',
})
export class Users implements OnInit {
  users: UserInterface[] = [];
  filteredUsers: UserInterface[] = [];
  deleteDialogVisible = false;
  selectedUser: UserInterface | null = null;
  imageUrl = environment.imageUrl;

  // Search and filter properties
  searchTerm: string = '';
  statusFilter: 'all' | 'active' | 'inactive' = 'all';
  emailConfirmedFilter: 'all' | 'confirmed' | 'notConfirmed' = 'all';
  roleFilter: string = 'all';

  protected readonly Pencil = Pencil;
  protected readonly Trash2 = Trash2;
  protected readonly Plus = Plus;
  protected readonly Eye = Eye;
  protected readonly Search = Search;
  protected readonly X = X;
  protected readonly Check = Check;

  constructor(
    protected router: Router,
    private hotToastService: HotToastService,
    private userService: UserService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.userService.getUsers().subscribe(
      (response: any) => {
        // Handle both array response and object with data property
        this.users = Array.isArray(response) ? response : response?.data || response || [];
        this.applyFilters();
        this.cdr.detectChanges();
      },
      (error) => {
        this.hotToastService.error('Failed to get users');
        this.cdr.detectChanges();
      }
    );
  }

  applyFilters(): void {
    this.filteredUsers = this.users.filter((user) => {
      // Search filter
      const matchesSearch =
        this.searchTerm === '' ||
        user.userName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.firstName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.lastName?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.email?.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        this.getDisplayPhone(user).toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        user.roles?.some((role) => role.toLowerCase().includes(this.searchTerm.toLowerCase()));

      // Status filter
      const matchesStatus =
        this.statusFilter === 'all' ||
        (this.statusFilter === 'active' && user.isActive) ||
        (this.statusFilter === 'inactive' && !user.isActive);

      // Email confirmed filter
      const matchesEmailConfirmed =
        this.emailConfirmedFilter === 'all' ||
        (this.emailConfirmedFilter === 'confirmed' && user.emailConfirmed) ||
        (this.emailConfirmedFilter === 'notConfirmed' && !user.emailConfirmed);

      // Role filter
      const matchesRole =
        this.roleFilter === 'all' ||
        (user.roles &&
          user.roles.some((role) => role.toLowerCase() === this.roleFilter.toLowerCase()));

      return matchesSearch && matchesStatus && matchesEmailConfirmed && matchesRole;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onFilterChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.statusFilter = 'all';
    this.emailConfirmedFilter = 'all';
    this.roleFilter = 'all';
    this.applyFilters();
  }

  getUniqueRoles(): string[] {
    const roles = new Set<string>();
    this.users.forEach((user) => {
      if (user.roles) {
        user.roles.forEach((role) => roles.add(role));
      }
    });
    return Array.from(roles).sort();
  }

  getDisplayPhone(user: UserInterface): string {
    if (!user.phoneNumber) {
      return '-';
    }
    // If phoneNumber already includes country code, return as is
    // Otherwise, prepend countryCode if available
    if (user.phoneNumber.startsWith('+')) {
      return user.phoneNumber;
    }
    return user.countryCode ? `${user.countryCode} ${user.phoneNumber}` : user.phoneNumber;
  }

  getFullName(user: UserInterface): string {
    const parts = [user.firstName, user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : '-';
  }

  getDisplayRoles(user: UserInterface): string {
    if (!user.roles || user.roles.length === 0) {
      return '-';
    }
    return user.roles.join(', ');
  }

  editUser(user: UserInterface): void {
    this.router.navigate(['/users/edit/', user.id]);
  }

  viewUserDetails(user: UserInterface): void {
    this.router.navigate(['/users/details/', user.id]);
  }

  deleteUser(user: UserInterface): void {
    this.selectedUser = user;
    this.deleteDialogVisible = true;
  }

  confirmDelete(): void {
    if (this.selectedUser) {
      // Toggle status: if user is active, deactivate; if inactive, activate
      const newStatus = !this.selectedUser.isActive;
      this.userService.toggleUserStatus(this.selectedUser.id, newStatus).subscribe(
        (response: any) => {
          let message = `User "${this.selectedUser!.userName}" ${
            newStatus ? 'activated' : 'deactivated'
          } successfully`;
          if (typeof response === 'string') {
            message = response;
          } else if (response?.message) {
            message = response.message;
          }
          this.hotToastService.success(message);
          // Update user status in the list
          const userIndex = this.users.findIndex((u) => u.id === this.selectedUser!.id);
          if (userIndex > -1) {
            this.users[userIndex].isActive = newStatus;
          }
          this.cdr.detectChanges();
          this.applyFilters(); // Reapply filters after status change
          this.deleteDialogVisible = false;
          this.selectedUser = null;
        },
        (error: any) => {
          const errorMessage =
            error?.error?.message || error?.message || 'Failed to toggle user status';
          this.hotToastService.error(errorMessage);
          this.deleteDialogVisible = false;
          this.selectedUser = null;
        }
      );
    }
  }

  cancelDelete(): void {
    this.deleteDialogVisible = false;
    this.selectedUser = null;
  }

  getFullImageUrl(
    imageUrl: string | null | undefined,
    type: 'user' | 'project' = 'project'
  ): string {
    if (!imageUrl) {
      return type === 'user' ? 'profile/person.jpg' : 'blog/3.jpg'; // Fallback image
    }
    return imageUrl.startsWith('http') ? imageUrl : `${this.imageUrl}${imageUrl}`;
  }
}
