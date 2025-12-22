import { Component, ViewChild, ElementRef, signal, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { CityService } from '../../../services/city.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { CityFormData } from '../../../interfaces/city.interface';
import { LucideAngularModule, ArrowLeft } from 'lucide-angular';

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
        data: ['', [Validators.required]],
      }),
    });

    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.isEdit = !!this.id;
      if (this.isEdit) {
        this.cityService.getCity(this.id!).subscribe(
          (response: any) => {
            this.cityForm.patchValue({
              nameEn: response.nameEn,
              nameAr: response.nameAr,
            });
            if (response.imagePath) {
              this.imagePreview.set(response.imagePath);
            }
            // If response has image object, use it; otherwise use imagePath
            if (response.image) {
              this.cityForm.patchValue({
                image: response.image,
              });
              if (response.image.data) {
                const imageDataUrl = `data:image/${response.image.extension.replace(
                  '.',
                  ''
                )};base64,${response.image.data}`;
                this.imagePreview.set(imageDataUrl);
              }
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.handleFileSelection(input);
  }

  private handleFileSelection(input: HTMLInputElement): void {
    if (input.files && input.files[0]) {
      const file = input.files[0];
      const reader = new FileReader();

      reader.onload = () => {
        const base64String = reader.result as string;
        // Store full data URL for preview
        this.imagePreview.set(base64String);

        // Remove data URL prefix (e.g., "data:image/png;base64,") for form data
        const base64Data = base64String.split(',')[1] || base64String;

        // Get file extension and ensure it starts with a dot
        const fileExtension = file.name.split('.').pop() || '';
        const extension = fileExtension ? `.${fileExtension}` : '';
        const fileName = file.name.replace(`.${fileExtension}`, '');

        this.cityForm.patchValue({
          image: {
            name: fileName,
            extension: extension, // Always send with dot prefix like ".png"
            data: base64Data,
          },
        });
      };

      reader.onerror = () => {
        console.error('Error reading file');
        this.hotToastService.error('Failed to read image file');
      };

      reader.readAsDataURL(file);
    } else {
      this.imagePreview.set(null);
    }
  }

  removeImage(): void {
    this.imagePreview.set(null);
    this.cityForm.patchValue({
      image: {
        name: '',
        extension: '',
        data: '',
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
    if (this.cityForm.valid) {
      const formData: CityFormData = this.cityForm.value;
      if (this.isEdit) {
        this.cityService.updateCity(this.id!, formData).subscribe(
          (response: any) => {
            this.hotToastService.success('City updated successfully');
            this.router.navigate(['/city']);
          },
          (error: any) => {
            this.hotToastService.error('Failed to update city');
          }
        );
      } else {
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
