import { Component, ChangeDetectorRef, signal, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';
import { StageInterface } from '../../../interfaces/stage.interface';
import { StagesService } from '../../../services/stages.service';
import { ProjectService } from '../../../services/project.service';
import { CityService } from '../../../services/city.service';
import { HotToastService } from '@ngxpert/hot-toast';

interface ProjectOption {
  id: string;
  nameEn: string;
  nameAr: string;
}

interface CityOption {
  id: string;
  nameEn: string;
  nameAr: string;
}

@Component({
  selector: 'app-add-stages',
  imports: [ReactiveFormsModule, CommonModule, LucideAngularModule],
  templateUrl: './add-stages.html',
  styleUrl: './add-stages.css',
})
export class AddStages {
  stageForm: FormGroup;
  isEdit = false;
  id: string | null = null;
  projects = signal<ProjectOption[]>([]);
  cities = signal<CityOption[]>([]);
  loadingProjects = signal<boolean>(true);
  loadingCities = signal<boolean>(true);
  cityDropdownOpen = false;
  protected readonly ArrowLeft = ArrowLeft;

  constructor(
    private fb: FormBuilder,
    private stagesService: StagesService,
    private projectService: ProjectService,
    private cityService: CityService,
    private hotToastService: HotToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.stageForm = this.fb.group({
      nameAr: ['', [Validators.required]],
      nameEn: ['', [Validators.required]],
      year: ['', [Validators.required]],
      projectId: ['', [Validators.required]],
      cityIds: [[], [Validators.required, Validators.minLength(1)]],
    });
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadCities();
    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.isEdit = !!this.id;
      if (this.isEdit) {
        this.stagesService.getStage(this.id!).subscribe(
          (response: any) => {
            // Extract cityIds from cities array if available, otherwise use cityIds directly
            let cityIds: string[] = [];
            if (response.cities && Array.isArray(response.cities) && response.cities.length > 0) {
              cityIds = response.cities.map((city: any) => city.cityId).filter((id: string) => !!id);
            } else if (response.cityIds && Array.isArray(response.cityIds)) {
              cityIds = response.cityIds;
            }

            this.stageForm.patchValue({
              nameAr: response.nameAr || '',
              nameEn: response.nameEn || '',
              year: response.year || '',
              projectId: response.projectId || '',
              cityIds: cityIds,
            });
            // Mark cityIds as touched and dirty to ensure proper form state
            this.stageForm.get('cityIds')?.markAsTouched();
            this.stageForm.get('cityIds')?.markAsDirty();
            this.cdr.detectChanges();
          },
          (error: any) => {
            this.hotToastService.error('Failed to load stage');
          }
        );
      }
    });
  }

  loadProjects(): void {
    this.loadingProjects.set(true);
    // Fetch all projects for the dropdown
    this.projectService.getProjects(1, 1000).subscribe(
      (response: any) => {
        const projectsList = response.data || [];
        this.projects.set(
          projectsList.map((project: any) => ({
            id: project.id,
            nameEn: project.nameEn || project.nameAr || 'Untitled Project',
            nameAr: project.nameAr || project.nameEn || 'مشروع بدون عنوان',
          }))
        );
        this.loadingProjects.set(false);
        this.cdr.detectChanges();
      },
      (error: any) => {
        console.error('Error loading projects:', error);
        this.hotToastService.error('Failed to load projects');
        this.loadingProjects.set(false);
        this.cdr.detectChanges();
      }
    );
  }

  loadCities(): void {
    this.loadingCities.set(true);
    // Fetch all cities for the dropdown
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
        this.hotToastService.error('Failed to load cities');
        this.loadingCities.set(false);
        this.cdr.detectChanges();
      }
    );
  }

  get f() {
    return this.stageForm.controls;
  }

  onSubmit(): void {
    if (this.stageForm.valid) {
      const formData = this.stageForm.value as StageInterface;

      if (this.isEdit && this.id) {
        this.stagesService.updateStage(this.id, { id: this.id, ...formData }).subscribe(
          (response: any) => {
            this.hotToastService.success('Stage updated successfully');
            this.router.navigate(['/stage']);
          },
          (error: any) => {
            this.hotToastService.error('Failed to update stage');
          }
        );
      } else {
        this.stagesService.addStage(formData).subscribe(
          (response: any) => {
            this.hotToastService.success('Stage added successfully');
            this.router.navigate(['/stage']);
          },
          (error: any) => {
            this.hotToastService.error('Failed to add stage');
          }
        );
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.stageForm.controls).forEach((key) => {
        const control = this.stageForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
    }
  }

  goBack(): void {
    this.router.navigate(['/stage']);
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    const clickedInside = target.closest('.city-dropdown-container');
    
    if (!clickedInside && this.cityDropdownOpen) {
      this.cityDropdownOpen = false;
      this.cdr.detectChanges();
    }
  }

  toggleCityDropdown(): void {
    this.cityDropdownOpen = !this.cityDropdownOpen;
  }

  isCitySelected(cityId: string): boolean {
    const selectedCities = this.stageForm.get('cityIds')?.value || [];
    return selectedCities.includes(cityId);
  }

  toggleCity(cityId: string): void {
    const currentCities = this.stageForm.get('cityIds')?.value || [];
    const index = currentCities.indexOf(cityId);
    
    if (index > -1) {
      // Remove city
      currentCities.splice(index, 1);
    } else {
      // Add city
      currentCities.push(cityId);
    }
    
    this.stageForm.patchValue({ cityIds: currentCities });
    this.stageForm.get('cityIds')?.markAsTouched();
  }

  getSelectedCitiesText(): string {
    const selectedCities = this.stageForm.get('cityIds')?.value || [];
    if (selectedCities.length === 0) {
      return 'Select cities';
    }
    
    const cityNames = this.cities()
      .filter(city => selectedCities.includes(city.id))
      .map(city => city.nameEn);
    
    if (cityNames.length <= 2) {
      return cityNames.join(', ');
    }
    
    return `${cityNames.length} cities selected`;
  }

  selectAllCities(): void {
    const allCityIds = this.cities().map(city => city.id);
    this.stageForm.patchValue({ cityIds: allCityIds });
    this.stageForm.get('cityIds')?.markAsTouched();
  }

  clearAllCities(): void {
    this.stageForm.patchValue({ cityIds: [] });
    this.stageForm.get('cityIds')?.markAsTouched();
  }
}
