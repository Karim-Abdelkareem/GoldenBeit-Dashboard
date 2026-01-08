import { Component, signal, computed, ChangeDetectorRef } from '@angular/core';
import {
  LucideAngularModule,
  ChevronRight,
  ChevronLeft,
  Pencil,
  Trash2,
  Plus,
  Eye,
  FolderKanban,
  Tag,
} from 'lucide-angular';
import { Project as ProjectInterface } from '../../interfaces/project';
import { ProjectService } from '../../services/project.service';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { DialogModule } from 'primeng/dialog';
import { HotToastService } from '@ngxpert/hot-toast';
import { splitIncludes } from '../../utils/string.utils';
import { environment } from '../../environment/environment';

@Component({
  selector: 'app-project',
  imports: [LucideAngularModule, CommonModule, DialogModule],
  templateUrl: './project.html',
  styleUrl: './project.css',
})
export class Project {
  projects = signal<ProjectInterface[]>([]);
  deleteDialogVisible = false;
  detailsDialogVisible = false;
  selectedProject: ProjectInterface | null = null;
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
  protected readonly FolderKanban = FolderKanban;
  protected readonly Tag = Tag;
  url = environment.imageUrl;

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
    private projectService: ProjectService,
    private cdr: ChangeDetectorRef,
    private router: Router,
    private hotToastService: HotToastService
  ) {}

  ngOnInit(): void {
    this.loadProjects();
  }

  loadProjects(): void {
    this.loading.set(true);
    const requestedPage = this.page();
    this.projectService.getProjects(requestedPage, this.itemsPerPage()).subscribe(
      (response: any) => {
        const projectsData = (response.data || []).map((project: any) => {
          // Extract unit type names from unitTypes array if available
          if (project.unitTypes && Array.isArray(project.unitTypes) && project.unitTypes.length > 0) {
            project.unitTypeNames = project.unitTypes.map((unitType: any) => 
              unitType.unitTypeNameEn || unitType.unitTypeNameAr || 'Unknown Unit Type'
            );
            // Extract unitTypeIds from unitTypes array if not already present
            if (!project.unitTypeIds || project.unitTypeIds.length === 0) {
              project.unitTypeIds = project.unitTypes.map((unitType: any) => unitType.unitTypeId);
            }
          }
          return project;
        });
        this.projects.set(projectsData);
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
        console.error('Error loading projects:', error);
        this.hotToastService.error('Failed to load projects');
        this.loading.set(false);
        this.cdr.detectChanges();
      }
    );
  }

  goToPage(pageNumber: number): void {
    if (pageNumber >= 1 && pageNumber <= this.totalPages()) {
      this.page.set(pageNumber);
      this.loadProjects();
      this.scrollToTop();
    }
  }

  goToPrevious(): void {
    if (this.page() > 1) {
      this.page.set(this.page() - 1);
      this.loadProjects();
      this.scrollToTop();
    }
  }

  goToNext(): void {
    if (this.page() < this.totalPages()) {
      this.page.set(this.page() + 1);
      this.loadProjects();
      this.scrollToTop();
    }
  }

  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  viewDetails(project: ProjectInterface): void {
    this.router.navigate(['/projects/details', project.id]);
  }

  closeDetailsDialog(): void {
    this.detailsDialogVisible = false;
    this.selectedProject = null;
  }

  editProject(project: ProjectInterface): void {
    this.router.navigate(['/projects/edit/', project.id]);
  }

  deleteProject(project: ProjectInterface): void {
    this.selectedProject = project;
    this.deleteDialogVisible = true;
  }

  confirmDelete(): void {
    if (this.selectedProject) {
      this.projectService.deleteProject(this.selectedProject.id).subscribe(
        (response: any) => {
          this.hotToastService.success(
            `Project "${
              this.selectedProject!.nameEn || this.selectedProject!.nameAr
            }" deleted successfully`
          );
          this.deleteDialogVisible = false;
          this.selectedProject = null;
          
          // Check if current page will be empty after deletion
          const remainingItems = this.projects().length - 1;
          if (remainingItems === 0 && this.page() > 1) {
            // Go to previous page if current page will be empty
            this.page.set(this.page() - 1);
          }
          
          // Reload projects to update pagination
          this.loadProjects();
        },
        (error: any) => {
          this.hotToastService.error('Failed to delete project');
          this.deleteDialogVisible = false;
          this.selectedProject = null;
        }
      );
    }
  }

  cancelDelete(): void {
    this.deleteDialogVisible = false;
    this.selectedProject = null;
  }

  addProject(): void {
    this.router.navigate(['/projects/add']);
  }

  formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateString;
    }
  }

  parseIncludes(includes?: string): string[] {
    return splitIncludes(includes);
  }

  getUnitTypeNames(project: ProjectInterface | null): string[] {
    if (!project) return [];
    
    // First try to use unitTypeNames if available
    if (project.unitTypeNames && project.unitTypeNames.length > 0) {
      return project.unitTypeNames;
    }
    
    // Otherwise, extract from unitTypes array
    if (project.unitTypes && project.unitTypes.length > 0) {
      return project.unitTypes.map(unitType => 
        unitType.unitTypeNameEn || unitType.unitTypeNameAr || 'Unknown Unit Type'
      );
    }
    
    return [];
  }
}
