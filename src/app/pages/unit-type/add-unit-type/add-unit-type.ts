import { Component, ViewChild, ElementRef, signal, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';
import { UnitTypeService } from '../../../services/unit-type.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { processImageInput, getEmptyImageData } from '../../../utils/image.utils';
import { environment } from '../../../environment/environment';

@Component({
  selector: 'app-add-unit-type',
  imports: [ReactiveFormsModule, CommonModule, LucideAngularModule],
  templateUrl: './add-unit-type.html',
  styleUrl: './add-unit-type.css',
})
export class AddUnitType {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  unitTypeForm: FormGroup;
  imagePreview = signal<string | null>(null);
  isEdit = false;
  id: string | null = null;
  imageUrl = environment.imageUrl;
  currentImagePath: string | null = null;
  hasNewImage = false;
  protected readonly ArrowLeft = ArrowLeft;

  constructor(
    private fb: FormBuilder,
    private unitTypeService: UnitTypeService,
    private hotToastService: HotToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.unitTypeForm = this.fb.group({
      nameAr: ['', [Validators.required]],
      nameEn: ['', [Validators.required]],
      image: this.fb.group({
        name: [''],
        extension: [''],
        data: [''],
      }),
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.isEdit = !!this.id;
      if (this.isEdit) {
        this.unitTypeService.getUnitType(this.id!).subscribe(
          (response: any) => {
            this.unitTypeForm.patchValue({
              nameAr: response.nameAr || '',
              nameEn: response.nameEn || '',
            });
            
            // Handle image preview and track current image path
            if (response.imagePath) {
              // Store the current image path
              this.currentImagePath = response.imagePath;
              
              // If imagePath exists, use it for preview (prepend base URL if needed)
              const imagePath = response.imagePath.startsWith('http') 
                ? response.imagePath 
                : `${this.imageUrl}${response.imagePath}`;
              this.imagePreview.set(imagePath);
            }
            this.cdr.detectChanges();
          },
          (error) => {
            console.error('Error loading unit type:', error);
            this.hotToastService.error('Failed to load unit type');
            this.router.navigate(['/unit-type']);
          }
        );
      }
    });
  }

  get f() {
    return this.unitTypeForm.controls;
  }

  get imageGroup() {
    return this.unitTypeForm.get('image') as FormGroup;
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
        this.currentImagePath = null;
        this.hasNewImage = true;
        
        // Update preview
        this.imagePreview.set(result.preview);

        // Update form with image data (full data URI format)
        this.unitTypeForm.patchValue({
          image: {
            name: result.name,
            extension: result.extension,
            data: result.data, // Full data URI format: data:image/<type>,<data>
          },
        });
      } else {
        // If no file selected, restore preview to current image if in edit mode
        if (this.isEdit && this.currentImagePath) {
          this.imagePreview.set(`${this.imageUrl}${this.currentImagePath}`);
        } else {
          this.imagePreview.set(null);
        }
        this.hasNewImage = false;
      }
    } catch (error: any) {
      console.error('Error processing image:', error);
      this.hotToastService.error(error.message || 'Failed to process image');
      
      // Restore preview to current image if in edit mode
      if (this.isEdit && this.currentImagePath) {
        this.imagePreview.set(`${this.imageUrl}${this.currentImagePath}`);
      } else {
        this.imagePreview.set(null);
      }
      this.hasNewImage = false;
    }
  }

  removeImage(): void {
    this.imagePreview.set(null);
    this.hasNewImage = false;
    this.currentImagePath = null; // Mark that we want to delete the current image
    
    const emptyImage = getEmptyImageData();
    this.unitTypeForm.patchValue({
      image: {
        name: emptyImage.name,
        extension: emptyImage.extension,
        data: emptyImage.data,
      },
    });
    // Reset file input
    if (this.fileInput?.nativeElement) {
      this.fileInput.nativeElement.value = '';
    }
  }

  triggerFileInput(): void {
    if (this.fileInput?.nativeElement) {
      // Reset the input value to allow selecting the same file again
      this.fileInput.nativeElement.value = '';
      // Use setTimeout to ensure the value is reset before clicking
      setTimeout(() => {
        this.fileInput.nativeElement.click();
      }, 0);
    }
  }

  onSubmit(): void {
    if (this.unitTypeForm.invalid) {
      this.unitTypeForm.markAllAsTouched();
      this.hotToastService.error('Please fill in all required fields');
      return;
    }

    const formValue = this.unitTypeForm.value;

    if (this.isEdit && this.id) {
      // Prepare update data
      const updateData: any = {
        id: this.id,
        nameAr: formValue.nameAr,
        nameEn: formValue.nameEn,
      };

      // Determine deleteCurrentImage value
      const imageData = formValue.image;
      const hasImageData = imageData && imageData.data && imageData.data.trim() !== '';
      
      if (this.hasNewImage && hasImageData) {
        // User uploaded a new image - delete old and upload new
        updateData.deleteCurrentImage = true;
        updateData.image = imageData;
      } else if (this.currentImagePath) {
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

      this.unitTypeService.updateUnitType(this.id, updateData).subscribe(
        (response: any) => {
          this.hotToastService.success('Unit type updated successfully');
          this.router.navigate(['/unit-type']);
        },
        (error: any) => {
          console.error('Error updating unit type:', error);
          this.hotToastService.error('Failed to update unit type');
        }
      );
    } else {
      this.unitTypeService.addUnitType(formValue).subscribe(
        (response: any) => {
          this.hotToastService.success('Unit type added successfully');
          this.router.navigate(['/unit-type']);
        },
        (error: any) => {
          console.error('Error adding unit type:', error);
          this.hotToastService.error('Failed to add unit type');
        }
      );
    }
  }

  goBack(): void {
    this.router.navigate(['/unit-type']);
  }
}
