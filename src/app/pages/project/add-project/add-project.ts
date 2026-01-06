import { Component, ViewChild, ElementRef, signal, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Plus, X } from 'lucide-angular';
import { ProjectFormData } from '../../../interfaces/project';
import { ProjectService } from '../../../services/project.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { splitIncludes, joinIncludes } from '../../../utils/string.utils';
import { processImageInput, getEmptyImageData } from '../../../utils/image.utils';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-add-project',
  imports: [ReactiveFormsModule, CommonModule, LucideAngularModule],
  templateUrl: './add-project.html',
  styleUrl: './add-project.css',
})
export class AddProject {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  projectForm: FormGroup;
  imagePreview = signal<string | null>(null);
  isEdit = false;
  id: string | null = null;
  imageUrl = environment.imageUrl;
  originalImagePath: string | null = null; // Track original image path for edit mode
  protected readonly ArrowLeft = ArrowLeft;
  protected readonly Plus = Plus;
  protected readonly X = X;

  constructor(
    private fb: FormBuilder,
    private projectService: ProjectService,
    private hotToastService: HotToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.projectForm = this.fb.group({
      nameAr: ['', [Validators.required]],
      nameEn: ['', [Validators.required]],
      subNameAr: ['', [Validators.required]],
      subNameEn: ['', [Validators.required]],
      descriptionAr: ['', [Validators.required]],
      descriptionEn: ['', [Validators.required]],
      includesAr: this.fb.array([this.fb.control('', Validators.required)]),
      includesEn: this.fb.array([this.fb.control('', Validators.required)]),
      image: this.fb.group({
        name: [''],
        extension: [''],
        data: [''], // Will be required only for add mode, not for edit mode
      }),
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.isEdit = !!this.id;
      
      // For edit mode, image is optional (can keep current image)
      // For add mode, image is required
      if (!this.isEdit) {
        this.projectForm.get('image.data')?.setValidators([Validators.required]);
        this.projectForm.get('image.data')?.updateValueAndValidity();
      }
      
      if (this.isEdit) {
        // Remove required validator for image.data in edit mode (image is optional)
        this.projectForm.get('image.data')?.clearValidators();
        this.projectForm.get('image.data')?.updateValueAndValidity();
        
        this.projectService.getProject(this.id!).subscribe(
          (response: any) => {
            // Handle response.data if it exists (wrapped response)
            const data = response.data || response;
            
            // Convert includes string to array using utility function
            const includesAr = Array.isArray(data.includesAr)
              ? data.includesAr
              : splitIncludes(data.includesAr);
            const includesEn = Array.isArray(data.includesEn)
              ? data.includesEn
              : splitIncludes(data.includesEn);

            // Clear existing form arrays
            while (this.includesAr.length !== 0) {
              this.includesAr.removeAt(0);
            }
            while (this.includesEn.length !== 0) {
              this.includesEn.removeAt(0);
            }

            // Add items to form arrays
            includesAr.forEach((item: string) => {
              this.includesAr.push(this.fb.control(item, Validators.required));
            });
            includesEn.forEach((item: string) => {
              this.includesEn.push(this.fb.control(item, Validators.required));
            });

            // If arrays are empty, add one empty control
            if (this.includesAr.length === 0) {
              this.includesAr.push(this.fb.control('', Validators.required));
            }
            if (this.includesEn.length === 0) {
              this.includesEn.push(this.fb.control('', Validators.required));
            }

            this.projectForm.patchValue({
              nameAr: data.nameAr || '',
              nameEn: data.nameEn || '',
              subNameAr: data.subNameAr || '',
              subNameEn: data.subNameEn || '',
              descriptionAr: data.descriptionAr || '',
              descriptionEn: data.descriptionEn || '',
            });

            // Handle image using image utils - convert imagePath to preview URL
            if (data.imagePath) {
              // Store original image path
              this.originalImagePath = data.imagePath;
              
              // Use image URL from environment to build full preview URL
              const fullImageUrl = data.imagePath.startsWith('http')
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
            this.hotToastService.error('Failed to load project');
          }
        );
      }
    });
  }

  get f() {
    return this.projectForm.controls;
  }

  get includesAr(): FormArray {
    return this.projectForm.get('includesAr') as FormArray;
  }

  get includesEn(): FormArray {
    return this.projectForm.get('includesEn') as FormArray;
  }

  addIncludeAr(): void {
    this.includesAr.push(this.fb.control('', Validators.required));
  }

  removeIncludeAr(index: number): void {
    if (this.includesAr.length > 1) {
      this.includesAr.removeAt(index);
    }
  }

  addIncludeEn(): void {
    this.includesEn.push(this.fb.control('', Validators.required));
  }

  removeIncludeEn(index: number): void {
    if (this.includesEn.length > 1) {
      this.includesEn.removeAt(index);
    }
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
        this.projectForm.patchValue({
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
      }
    } catch (error: any) {
      console.error('Error processing image:', error);
      this.hotToastService.error(error.message || 'Failed to process image');
      this.imagePreview.set(null);
    }
  }

  removeImage(): void {
    this.imagePreview.set(null);
    this.originalImagePath = null; // Clear original image path when removing
    const emptyImage = getEmptyImageData();
    this.projectForm.patchValue({
      image: {
        name: emptyImage.name,
        extension: emptyImage.extension,
        data: emptyImage.data,
      },
    });
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onSubmit(): void {
    // For edit mode, temporarily remove image validation if no new image is selected
    const imageData = this.projectForm.value.image;
    const hasNewImage = imageData && imageData.data && imageData.data.trim() !== '';
    
    if (this.isEdit && !hasNewImage) {
      // Temporarily remove required validator for image.data in edit mode
      this.projectForm.get('image.data')?.clearValidators();
      this.projectForm.get('image.data')?.updateValueAndValidity();
    } else if (!this.isEdit) {
      // For add mode, ensure image is required
      this.projectForm.get('image.data')?.setValidators([Validators.required]);
      this.projectForm.get('image.data')?.updateValueAndValidity();
    }

    if (this.projectForm.valid) {
      if (this.isEdit && this.id) {
        // For update: check if user selected a new image
        const updateData: any = {
          id: this.id,
          nameAr: this.projectForm.value.nameAr,
          nameEn: this.projectForm.value.nameEn,
          subNameAr: this.projectForm.value.subNameAr,
          subNameEn: this.projectForm.value.subNameEn,
          descriptionAr: this.projectForm.value.descriptionAr,
          descriptionEn: this.projectForm.value.descriptionEn,
          includesAr: this.includesAr.value.filter((item: string) => item.trim() !== ''),
          includesEn: this.includesEn.value.filter((item: string) => item.trim() !== ''),
        };

        // If user selected a new image, add deleteCurrentImage: true and image object
        if (hasNewImage) {
          updateData.deleteCurrentImage = true;
          updateData.image = imageData;
        } else if (this.originalImagePath) {
          // User is keeping the existing image - don't delete it, don't send image
          updateData.deleteCurrentImage = false;
          // Don't send image object when keeping existing image
        } else {
          // User removed the image - delete it
          updateData.deleteCurrentImage = true;
          // Send empty image data
          updateData.image = {
            name: '',
            extension: '',
            data: ''
          };
        }

        this.projectService.updateProject(this.id, updateData).subscribe(
          (response: any) => {
            this.hotToastService.success('Project updated successfully');
            this.router.navigate(['/projects']);
          },
          (error: any) => {
            this.hotToastService.error('Failed to update project');
          }
        );
      } else {
        // For add: always send image (required)
        const formData: ProjectFormData = {
          nameAr: this.projectForm.value.nameAr,
          nameEn: this.projectForm.value.nameEn,
          subNameAr: this.projectForm.value.subNameAr,
          subNameEn: this.projectForm.value.subNameEn,
          descriptionAr: this.projectForm.value.descriptionAr,
          descriptionEn: this.projectForm.value.descriptionEn,
          includesAr: this.includesAr.value.filter((item: string) => item.trim() !== ''),
          includesEn: this.includesEn.value.filter((item: string) => item.trim() !== ''),
          image: this.projectForm.value.image,
        };
        
        this.projectService.addProject(formData).subscribe(
          (response: any) => {
            this.hotToastService.success('Project added successfully');
            this.router.navigate(['/projects']);
          },
          (error: any) => {
            this.hotToastService.error('Failed to add project');
          }
        );
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.projectForm.controls).forEach((key) => {
        const control = this.projectForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      // Mark form arrays as touched
      this.includesAr.controls.forEach((control) => control.markAsTouched());
      this.includesEn.controls.forEach((control) => control.markAsTouched());
    }
  }

  goBack(): void {
    this.router.navigate(['/projects']);
  }
}
