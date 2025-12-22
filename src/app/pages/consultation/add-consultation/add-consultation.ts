import { Component, ViewChild, ElementRef, signal, ChangeDetectorRef } from '@angular/core';
import { ConsultationService } from '../../../services/consultation.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormArray } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Plus, X } from 'lucide-angular';
import { ConsultationFormData } from '../../../interfaces/cosultation.interface';
import { HotToastService } from '@ngxpert/hot-toast';

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
        data: ['', [Validators.required]],
      }),
    });

    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.isEdit = !!this.id;
      if (this.isEdit) {
        this.consultationService.getConsultation(this.id!).subscribe(
          (response: any) => {
            this.consultationForm.patchValue({
              nameAr: response.nameAr,
              nameEn: response.nameEn,
              briefAr: response.briefAr,
              briefEn: response.briefEn,
              descriptionAr: response.descriptionAr,
              descriptionEn: response.descriptionEn,
            });

            // Handle details arrays
            if (response.detailsAr && Array.isArray(response.detailsAr)) {
              const detailsArArray = this.consultationForm.get('detailsAr') as FormArray;
              detailsArArray.clear();
              response.detailsAr.forEach((detail: string) => {
                detailsArArray.push(this.fb.control(detail));
              });
            }

            if (response.detailsEn && Array.isArray(response.detailsEn)) {
              const detailsEnArray = this.consultationForm.get('detailsEn') as FormArray;
              detailsEnArray.clear();
              response.detailsEn.forEach((detail: string) => {
                detailsEnArray.push(this.fb.control(detail));
              });
            }

            // Handle image
            if (response.image) {
              this.consultationForm.patchValue({ image: response.image });
              if (response.image.data) {
                const imageDataUrl = `data:image/${response.image.extension.replace(
                  '.',
                  ''
                )};base64,${response.image.data}`;
                this.imagePreview.set(imageDataUrl);
              }
            } else if (response.imagePath) {
              // Fallback to imagePath if image object is not available
              this.imagePreview.set(response.imagePath);
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
        this.imagePreview.set(base64String);

        const base64Data = base64String.split(',')[1] || base64String;
        const fileExtension = file.name.split('.').pop() || '';
        const extension = fileExtension ? `.${fileExtension}` : '';
        const fileName = file.name.replace(`.${fileExtension}`, '');

        this.consultationForm.patchValue({
          image: {
            name: fileName,
            extension: extension,
            data: base64Data,
          },
        });
      };

      reader.onerror = () => {
        this.hotToastService.error('Failed to read image file');
      };

      reader.readAsDataURL(file);
    } else {
      this.imagePreview.set(null);
    }
  }

  removeImage(): void {
    this.imagePreview.set(null);
    this.consultationForm.patchValue({
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
    if (this.consultationForm.valid) {
      const formData: ConsultationFormData = {
        nameAr: this.consultationForm.value.nameAr,
        nameEn: this.consultationForm.value.nameEn,
        briefAr: this.consultationForm.value.briefAr,
        briefEn: this.consultationForm.value.briefEn,
        descriptionAr: this.consultationForm.value.descriptionAr,
        descriptionEn: this.consultationForm.value.descriptionEn,
        detailsAr: this.detailsArArray.value.filter((d: string) => d.trim() !== ''),
        detailsEn: this.detailsEnArray.value.filter((d: string) => d.trim() !== ''),
        image: this.consultationForm.value.image,
      };

      if (this.isEdit) {
        this.consultationService.updateConsultation(this.id!, formData).subscribe(
          (response: any) => {
            this.hotToastService.success('Consultation updated successfully');
            this.router.navigate(['/consultations']);
          },
          (error: any) => {
            this.hotToastService.error('Failed to update consultation');
          }
        );
      } else {
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
