import { Component, ViewChild, ElementRef, signal, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CityService } from '../../../services/city.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { CityFormData } from '../../../interfaces/city.interface';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';
import { processImageInput, getEmptyImageData } from '../../../utils/image.utils';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-add-city',
  imports: [ReactiveFormsModule, CommonModule, LucideAngularModule],
  templateUrl: './add-city.html',
  styleUrl: './add-city.css',
})
export class AddCity {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  cityForm: FormGroup;
  imagePreview = signal<string | null>(null);
  isEdit = false;
  id: string | null = null;
  imageUrl = environment.imageUrl;
  originalImagePath: string | null = null; // Track original image path for edit mode
  protected readonly ArrowLeft = ArrowLeft;

  constructor(
    private cityService: CityService,
    private hotToastService: HotToastService,
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.cityForm = this.fb.group({
      nameEn: ['', [Validators.required]],
      nameAr: ['', [Validators.required]],
      image: this.fb.group({
        name: [''],
        extension: [''],
        data: [''], // Will be required only for add mode, not for edit mode
      }),
    });

    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.isEdit = !!this.id;

      // For edit mode, image is optional (can keep current image)
      // For add mode, image is required
      if (!this.isEdit) {
        this.cityForm.get('image.data')?.setValidators([Validators.required]);
        this.cityForm.get('image.data')?.updateValueAndValidity();
      }

      if (this.isEdit) {
        // Remove required validator for image.data in edit mode (image is optional)
        this.cityForm.get('image.data')?.clearValidators();
        this.cityForm.get('image.data')?.updateValueAndValidity();

        this.cityService.getCity(this.id!).subscribe(
          (response: any) => {
            // Handle response.data if it exists (wrapped response)
            const data = response.data || response;

            this.cityForm.patchValue({
              nameEn: data.nameEn,
              nameAr: data.nameAr,
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
            this.hotToastService.error('Failed to get city');
          }
        );
      }
    });
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
        this.cityForm.patchValue({
          image: {
            name: result.name,
            extension: result.extension,
            data: result.data, // Full data URI format: data:image/<type>,<data>
          },
        });
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
    this.cityForm.patchValue({
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

  triggerFileInput(): void {
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
      setTimeout(() => {
        this.fileInput.nativeElement.click();
      }, 0);
    }
  }

  onSubmit(): void {
    // For edit mode, temporarily remove image validation if no new image is selected
    const imageData = this.cityForm.value.image;
    const hasNewImage = imageData && imageData.data && imageData.data.trim() !== '';

    if (this.isEdit && !hasNewImage) {
      // Temporarily remove required validator for image.data in edit mode
      this.cityForm.get('image.data')?.clearValidators();
      this.cityForm.get('image.data')?.updateValueAndValidity();
    } else if (!this.isEdit) {
      // For add mode, ensure image is required
      this.cityForm.get('image.data')?.setValidators([Validators.required]);
      this.cityForm.get('image.data')?.updateValueAndValidity();
    }

    if (this.cityForm.valid) {
      if (this.isEdit) {
        // For update: check if user selected a new image
        const updateData: any = {
          id: this.id!,
          nameEn: this.cityForm.value.nameEn,
          nameAr: this.cityForm.value.nameAr,
        };

        // If user selected a new image, add deleteCurrentImage: true and image object
        if (hasNewImage) {
          updateData.deleteCurrentImage = true;
          updateData.image = imageData;
        }
        // If no new image, don't send image or deleteCurrentImage (keep current image)

        this.cityService.updateCity(this.id!, updateData).subscribe(
          (response: any) => {
            this.hotToastService.success('City updated successfully');
            this.router.navigate(['/city']);
          },
          (error: any) => {
            console.log(error);
            this.hotToastService.error('Failed to update city');
          }
        );
      } else {
        // For add: always send image (required)
        const formData: CityFormData = this.cityForm.value;
        this.cityService.addCity(formData).subscribe(
          (response: any) => {
            this.hotToastService.success('City added successfully');
            this.router.navigate(['/city']);
          },
          (error: any) => {
            this.hotToastService.error('Failed to add city');
          }
        );
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.cityForm.controls).forEach((key) => {
        const control = this.cityForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
    }
  }

  get f() {
    return this.cityForm.controls;
  }

  get imageGroup() {
    return this.cityForm.get('image') as FormGroup;
  }

  goBack(): void {
    this.router.navigate(['/city']);
  }
}
