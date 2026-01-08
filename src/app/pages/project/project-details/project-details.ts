import { Component, OnInit, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from '../../../services/project.service';
import { UnitTypeService } from '../../../services/unit-type.service';
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
  unitTypes = signal<Map<string, string>>(new Map());

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private projectService: ProjectService,
    private unitTypeService: UnitTypeService,
    private hotToastService: HotToastService
  ) {}

  ngOnInit(): void {
    this.loadUnitTypes();
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadProject(id);
    } else {
      this.hotToastService.error('Project ID not found');
      this.router.navigate(['/projects']);
    }
  }

  loadUnitTypes(): void {
    // Fetch all unit types to map IDs to names
    this.unitTypeService.getUnitTypes(1, 1000).subscribe(
      (response: any) => {
        const unitTypesList = response.data || [];
        const unitTypeMap = new Map<string, string>();
        unitTypesList.forEach((unitType: any) => {
          unitTypeMap.set(unitType.id, unitType.nameEn || unitType.nameAr || 'Unknown Unit Type');
        });
        this.unitTypes.set(unitTypeMap);
      },
      (error) => {
        console.error('Error loading unit types:', error);
      }
    );
  }

  getUnitTypeNames(unitTypeIds: string[] | undefined): string[] {
    const project = this.project();
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
    
    // Fallback: use unitTypeIds with the map (if we still need it)
    if (unitTypeIds && unitTypeIds.length > 0) {
      const unitTypeMap = this.unitTypes();
      return unitTypeIds
        .map(id => unitTypeMap.get(id))
        .filter((name): name is string => !!name);
    }
    
    return [];
  }

  loadProject(id: string): void {
    this.loading.set(true);
    this.projectService.getProject(id).subscribe(
      (response: any) => {
        const data = response.data || response;
        
        // Extract unit type names from unitTypes array if available
        if (data.unitTypes && Array.isArray(data.unitTypes) && data.unitTypes.length > 0) {
          data.unitTypeNames = data.unitTypes.map((unitType: any) => 
            unitType.unitTypeNameEn || unitType.unitTypeNameAr || 'Unknown Unit Type'
          );
          // Extract unitTypeIds from unitTypes array if not already present
          if (!data.unitTypeIds || data.unitTypeIds.length === 0) {
            data.unitTypeIds = data.unitTypes.map((unitType: any) => unitType.unitTypeId);
          }
        }
        
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

