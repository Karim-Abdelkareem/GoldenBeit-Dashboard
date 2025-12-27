import { Component, ViewChild, ElementRef, signal, ChangeDetectorRef } from '@angular/core';
import { ConsultationService } from '../../../services/consultation.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Plus, X } from 'lucide-angular';
import { ConsultationFormData } from '../../../interfaces/cosultation.interface';
import { HotToastService } from '@ngxpert/hot-toast';
import { processImageInput, getEmptyImageData } from '../../../utils/image.utils';
import { splitIncludes, joinIncludes } from '../../../utils/string.utils';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-add-consultation',
  imports: [ReactiveFormsModule, CommonModule, LucideAngularModule],
  templateUrl: './add-consultation.html',
  styleUrl: './add-consultation.css',
})
export class AddConsultation {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  consultationForm: FormGroup;
  imagePreview = signal<string | null>(null);
  isEdit = false;
  id: string | null = null;
  imageUrl = environment.imageUrl;
  originalImagePath: string | null = null; // Track original image path for edit mode
  protected readonly ArrowLeft = ArrowLeft;
  protected readonly Plus = Plus;
  protected readonly X = X;

  constructor(
    private consultationService: ConsultationService,
    private fb: FormBuilder,
    private hotToastService: HotToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.consultationForm = this.fb.group({
      nameAr: ['', [Validators.required]],
      nameEn: ['', [Validators.required]],
      briefAr: ['', [Validators.required]],
      briefEn: ['', [Validators.required]],
      descriptionAr: ['', [Validators.required]],
      descriptionEn: ['', [Validators.required]],
      detailsAr: this.fb.array([]),
      detailsEn: this.fb.array([]),
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
        this.consultationForm.get('image.data')?.setValidators([Validators.required]);
        this.consultationForm.get('image.data')?.updateValueAndValidity();
      }

      if (this.isEdit) {
        // Remove required validator for image.data in edit mode (image is optional)
        this.consultationForm.get('image.data')?.clearValidators();
        this.consultationForm.get('image.data')?.updateValueAndValidity();

        this.consultationService.getConsultation(this.id!).subscribe(
          (response: any) => {
            // Handle response.data if it exists (wrapped response)
            const data = response.data || response;

            this.consultationForm.patchValue({
              nameAr: data.nameAr,
              nameEn: data.nameEn,
              briefAr: data.briefAr,
              briefEn: data.briefEn,
              descriptionAr: data.descriptionAr,
              descriptionEn: data.descriptionEn,
            });

            // Handle details using string utils - split string to array
            const detailsArArray = this.consultationForm.get('detailsAr') as FormArray;
            detailsArArray.clear();
            const detailsArParsed = splitIncludes(data.detailsAr);
            if (detailsArParsed.length > 0) {
              detailsArParsed.forEach((detail: string) => {
                detailsArArray.push(this.fb.control(detail));
              });
            } else {
              // Add at least one empty field
              detailsArArray.push(this.fb.control(''));
            }

            const detailsEnArray = this.consultationForm.get('detailsEn') as FormArray;
            detailsEnArray.clear();
            const detailsEnParsed = splitIncludes(data.detailsEn);
            if (detailsEnParsed.length > 0) {
              detailsEnParsed.forEach((detail: string) => {
                detailsEnArray.push(this.fb.control(detail));
              });
            } else {
              // Add at least one empty field
              detailsEnArray.push(this.fb.control(''));
            }

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
            this.hotToastService.error('Failed to get consultation');
          }
        );
      } else {
        // Add initial detail fields
        this.addDetail('detailsAr');
        this.addDetail('detailsEn');
      }
    });
  }

  get detailsArArray(): FormArray {
    return this.consultationForm.get('detailsAr') as FormArray;
  }

  get detailsEnArray(): FormArray {
    return this.consultationForm.get('detailsEn') as FormArray;
  }

  addDetail(fieldName: 'detailsAr' | 'detailsEn'): void {
    const array = this.consultationForm.get(fieldName) as FormArray;
    array.push(this.fb.control('', [Validators.required]));
  }

  removeDetail(fieldName: 'detailsAr' | 'detailsEn', index: number): void {
    const array = this.consultationForm.get(fieldName) as FormArray;
    if (array.length > 1) {
      array.removeAt(index);
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
        this.consultationForm.patchValue({
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
    this.consultationForm.patchValue({
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
    const imageData = this.consultationForm.value.image;
    const hasNewImage = imageData && imageData.data && imageData.data.trim() !== '';

    if (this.isEdit && !hasNewImage) {
      // Temporarily remove required validator for image.data in edit mode
      this.consultationForm.get('image.data')?.clearValidators();
      this.consultationForm.get('image.data')?.updateValueAndValidity();
    } else if (!this.isEdit) {
      // For add mode, ensure image is required
      this.consultationForm.get('image.data')?.setValidators([Validators.required]);
      this.consultationForm.get('image.data')?.updateValueAndValidity();
    }

    if (this.consultationForm.valid) {
      // Convert details arrays to strings using string utils
      const detailsArFiltered = this.detailsArArray.value.filter((d: string) => d.trim() !== '');
      const detailsEnFiltered = this.detailsEnArray.value.filter((d: string) => d.trim() !== '');

      if (this.isEdit) {
        // For update: check if user selected a new image
        const updateData: any = {
          id: this.id!,
          nameAr: this.consultationForm.value.nameAr,
          nameEn: this.consultationForm.value.nameEn,
          briefAr: this.consultationForm.value.briefAr,
          briefEn: this.consultationForm.value.briefEn,
          descriptionAr: this.consultationForm.value.descriptionAr,
          descriptionEn: this.consultationForm.value.descriptionEn,
          detailsAr: detailsArFiltered,
          detailsEn: detailsEnFiltered,
        };

        // If user selected a new image, add deleteCurrentImage: true and image object
        if (hasNewImage) {
          updateData.deleteCurrentImage = true;
          updateData.image = imageData;
        }
        // If no new image, don't send image or deleteCurrentImage (keep current image)

        this.consultationService.updateConsultation(this.id!, updateData).subscribe(
          (response: any) => {
            this.hotToastService.success('Consultation updated successfully');
            this.router.navigate(['/consultations']);
          },
          (error: any) => {
            this.hotToastService.error('Failed to update consultation');
          }
        );
      } else {
        // For add: always send image (required)
        const formData: ConsultationFormData = {
          nameAr: this.consultationForm.value.nameAr,
          nameEn: this.consultationForm.value.nameEn,
          briefAr: this.consultationForm.value.briefAr,
          briefEn: this.consultationForm.value.briefEn,
          descriptionAr: this.consultationForm.value.descriptionAr,
          descriptionEn: this.consultationForm.value.descriptionEn,
          detailsAr: detailsArFiltered,
          detailsEn: detailsEnFiltered,
          image: imageData,
        };

        this.consultationService.addConsultation(formData).subscribe(
          (response: any) => {
            this.hotToastService.success('Consultation added successfully');
            this.router.navigate(['/consultations']);
          },
          (error: any) => {
            this.hotToastService.error('Failed to add consultation');
          }
        );
      }
    } else {
      Object.keys(this.consultationForm.controls).forEach((key) => {
        const control = this.consultationForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
    }
  }

  get f() {
    return this.consultationForm.controls;
  }

  get imageGroup() {
    return this.consultationForm.get('image') as FormGroup;
  }

  goBack(): void {
    this.router.navigate(['/consultations']);
  }
}
