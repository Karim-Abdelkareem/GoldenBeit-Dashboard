import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../../services/project.service';
import { Project as ProjectData } from '../../../interfaces/project';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';
import { HotToastService } from '@ngxpert/hot-toast';
import { environment } from '../../../environment/environment';
import { splitIncludes } from '../../../utils/string.utils';

@Component({
  selector: 'app-project-details',
  imports: [CommonModule, LucideAngularModule, DatePipe],
  templateUrl: './project-details.html',
  styleUrl: './project-details.css',
})
export class ProjectDetails implements OnInit {
  project = signal<ProjectData | null>(null);
  loading = signal<boolean>(true);
  protected readonly ArrowLeft = ArrowLeft;
  imageUrl = environment.imageUrl;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private hotToastService: HotToastService
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProject(id);
    } else {
      this.hotToastService.error('Project ID not found');
      this.router.navigate(['/projects']);
    }
  }

  loadProject(id: string): void {
    this.loading.set(true);
    this.projectService.getProject(id).subscribe(
      (response: any) => {
        const data = response.data || response;
        this.project.set(data);
        this.loading.set(false);
      },
      (error: any) => {
        this.hotToastService.error('Failed to load project');
        this.loading.set(false);
        this.router.navigate(['/projects']);
      }
    );
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }

  getImageUrl(): string {
    const imagePath = this.project()?.imagePath;
    if (!imagePath) {
      return '/blog/3.jpg'; // Default fallback image
    }
    // If imagePath already starts with http, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    // Otherwise, prepend the base URL
    return `${this.imageUrl}${imagePath}`;
  }

  parseIncludes(includes: string): string[] {
    if (!includes) return [];
    if (Array.isArray(includes)) return includes;
    return splitIncludes(includes);
  }
}

