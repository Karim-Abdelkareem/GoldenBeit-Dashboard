import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { UserService } from '../../../services/user.service';
import { UserInterface } from '../../../interfaces/user.interface';
import { Role } from '../../../interfaces/role.interface';
import { LucideAngularModule, ArrowLeft, Check, X } from 'lucide-angular';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-user-details',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './user-details.html',
  styleUrl: './user-details.css',
})
export class UserDetails implements OnInit {
  user: UserInterface | null = null;
  availableRoles: Role[] = [];
  selectedRoles: Role[] = [];
  loading = false;
  saving = false;
  protected readonly ArrowLeft = ArrowLeft;
  protected readonly Check = Check;
  protected readonly X = X;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private userService: UserService,
    private hotToastService: HotToastService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadUser(id);
      this.loadAvailableRoles(id);
    } else {
      this.hotToastService.error('User ID not found');
      this.router.navigate(['/users']);
    }
  }

  loadUser(id: string): void {
    this.loading = true;
    this.userService.getUser(id).subscribe(
      (response: any) => {
        this.user = response;
        this.loading = false;
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.hotToastService.error('Failed to load user');
        this.loading = false;
        this.router.navigate(['/users']);
        this.cdr.detectChanges();
      }
    );
  }

  loadAvailableRoles(id: string): void {
    this.userService.getUserRoles(id).subscribe(
      (response: any) => {
        // Handle both array response and object with data property
        this.availableRoles = Array.isArray(response) ? response : response?.data || response || [];
        // Initialize selectedRoles with enabled roles
        this.selectedRoles = this.availableRoles.filter((role) => role.enabled);
        this.cdr.detectChanges();
      },
      (error: any) => {
        this.hotToastService.error('Failed to load roles');
        this.cdr.detectChanges();
      }
    );
  }

  toggleRole(role: Role): void {
    const index = this.selectedRoles.findIndex((r) => r.roleId === role.roleId);
    if (index > -1) {
      // Remove role if already selected
      this.selectedRoles = this.selectedRoles.filter((r) => r.roleId !== role.roleId);
    } else {
      // Add role if not selected
      this.selectedRoles = [...this.selectedRoles, role];
    }
  }

  isRoleSelected(role: Role): boolean {
    return this.selectedRoles.some((r) => r.roleId === role.roleId);
  }

  assignRoles(): void {
    if (!this.user?.id) {
      return;
    }

    const userId = this.user.id;
    this.saving = true;

    // Build userRoles array with all available roles, updating enabled status based on selection
    // If role is checked (selected) → enabled: true, else → enabled: false
    const userRoles = this.availableRoles.map((role) => ({
      roleId: role.roleId,
      roleName: role.roleName,
      description: role.description,
      enabled: this.isRoleSelected(role), // true if checked, false if not checked
    }));

    this.userService.addUserRole(userId, userRoles).subscribe(
      (response: any) => {
        let message = 'Roles assigned successfully';
        if (typeof response === 'string') {
          message = response;
        } else if (response?.message) {
          message = response.message;
        }
        this.hotToastService.success(message);
        this.saving = false;
        // Reload roles to reflect changes
        this.loadAvailableRoles(userId);
        this.cdr.detectChanges();
      },
      (error: any) => {
        const errorMessage = error?.error?.message || error?.message || 'Failed to assign roles';
        this.hotToastService.error(errorMessage);
        this.saving = false;
        this.cdr.detectChanges();
      }
    );
  }

  getFullName(user: UserInterface | null): string {
    if (!user) return '-';
    const parts = [user.firstName, user.lastName].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : '-';
  }

  getDisplayPhone(user: UserInterface | null): string {
    if (!user || !user.phoneNumber) {
      return '-';
    }
    if (user.phoneNumber.startsWith('+')) {
      return user.phoneNumber;
    }
    return user.countryCode ? `${user.countryCode} ${user.phoneNumber}` : user.phoneNumber;
  }

  goBack(): void {
    this.router.navigate(['/users']);
  }
}
