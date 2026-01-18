import { Component, ChangeDetectorRef, signal, HostListener, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, X } from 'lucide-angular';
import { StageInterface } from '../../../interfaces/stage.interface';
import { StagesService } from '../../../services/stages.service';
import { ProjectService } from '../../../services/project.service';
import { CityService } from '../../../services/city.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { environment } from '../../../environment/environment';
import { processImageInput } from '../../../utils/image.utils';

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
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  stageForm: FormGroup;
  isEdit = false;
  id: string | null = null;
  projects = signal<ProjectOption[]>([]);
  cities = signal<CityOption[]>([]);
  loadingProjects = signal<boolean>(true);
  loadingCities = signal<boolean>(true);
  cityDropdownOpen = false;
  imagePreview = signal<string | null>(null);
  imageUrl = environment.imageUrl;
  originalImagePath: string | null = null; // Track original image path for edit mode
  protected readonly ArrowLeft = ArrowLeft;
  protected readonly X = X;

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
      image: this.fb.group({
        name: [''],
        extension: [''],
        data: [''], // Will be required only for add mode, not for edit mode
      }),
    });
  }

  ngOnInit(): void {
    this.loadProjects();
    this.loadCities();
    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.isEdit = !!this.id;
      
      // For edit mode, image is optional (can keep current image)
      // For add mode, image is required
      if (!this.isEdit) {
        this.stageForm.get('image.data')?.setValidators([Validators.required]);
        this.stageForm.get('image.data')?.updateValueAndValidity();
      }
      
      if (this.isEdit) {
        // Remove required validator for image.data in edit mode (image is optional)
        this.stageForm.get('image.data')?.clearValidators();
        this.stageForm.get('image.data')?.updateValueAndValidity();
        
        this.stagesService.getStage(this.id!).subscribe(
          (response: any) => {
            // Handle response.data if it exists (wrapped response)
            const data = response.data || response;
            
            // Extract cityIds from cities array if available, otherwise use cityIds directly
            let cityIds: string[] = [];
            if (data.cities && Array.isArray(data.cities) && data.cities.length > 0) {
              cityIds = data.cities.map((city: any) => city.cityId).filter((id: string) => !!id);
            } else if (data.cityIds && Array.isArray(data.cityIds)) {
              cityIds = data.cityIds;
            }

            this.stageForm.patchValue({
              nameAr: data.nameAr || '',
              nameEn: data.nameEn || '',
              year: data.year || '',
              projectId: data.projectId || '',
              cityIds: cityIds,
            });
            // Mark cityIds as touched and dirty to ensure proper form state
            this.stageForm.get('cityIds')?.markAsTouched();
            this.stageForm.get('cityIds')?.markAsDirty();

            // Handle image using image utils - convert imagePath to preview URL
            if (data.imagePath) {
              // Store original image path
              this.originalImagePath = data.imagePath;
              
              // Use image URL from environment to build full preview URL
              const fullImageUrl = data.imagePath.startsWith('http')
                ? data.imagePath
                : data.imagePath.startsWith('data:image/')
                ? data.imagePath
                : `${this.imageUrl}${data.imagePath}`;
              this.imagePreview.set(fullImageUrl);
              
              // Note: We don't set the image form control here because imagePath
              // is just a URL string, not the image data object needed for upload.
              // If user wants to update the image, they need to select a new file.
            }

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
      const formValue = this.stageForm.value;
      
      // Prepare form data - include image only if it was changed (has data)
      const formData: any = {
        nameAr: formValue.nameAr,
        nameEn: formValue.nameEn,
        year: formValue.year,
        projectId: formValue.projectId,
        cityIds: formValue.cityIds,
      };

      // Include image only if it has data (new image selected or in add mode)
      if (formValue.image && formValue.image.data) {
        formData.image = formValue.image;
      } else if (this.isEdit && this.originalImagePath && !formValue.image.data) {
        // In edit mode, if no new image selected but original exists, don't send image
        // The backend should keep the existing image
      }

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

  triggerFileInput(): void {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
      setTimeout(() => {
        this.fileInput.nativeElement.click();
      }, 0);
    }
  }

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    await this.handleFileSelection(input);
  }

  private async handleFileSelection(input: HTMLInputElement): Promise<void> {
    try {
      const result = await processImageInput(input);
      
      if (result) {
        // Clear original image path when new image is selected
        this.originalImagePath = null;
        
        // Update preview
        this.imagePreview.set(result.preview);

        // Update form with image data (full data URI format)
        this.stageForm.patchValue({
          image: {
            name: result.name,
            extension: result.extension,
            data: result.data, // Full data URI format: data:image/<type>,<data>
          },
        });

        this.cdr.detectChanges();
      } else {
        // If no file selected, clear preview
        this.imagePreview.set(null);
        this.stageForm.patchValue({
          image: {
            name: '',
            extension: '',
            data: '',
          },
        });
        this.cdr.detectChanges();
      }
    } catch (error) {
      console.error('Error processing image:', error);
      this.hotToastService.error('Failed to process image. Please try again.');
    }
  }

  removeImage(): void {
    this.imagePreview.set(null);
    this.originalImagePath = null;
    this.stageForm.patchValue({
      image: {
        name: '',
        extension: '',
        data: '',
      },
    });
    
    // Re-apply required validator if in add mode
    if (!this.isEdit) {
      this.stageForm.get('image.data')?.setValidators([Validators.required]);
      this.stageForm.get('image.data')?.updateValueAndValidity();
    }
    
    this.cdr.detectChanges();
  }
}
