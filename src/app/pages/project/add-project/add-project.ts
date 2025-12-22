import { Component, ViewChild, ElementRef, signal, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Plus, X } from 'lucide-angular';
import { ProjectFormData } from '../../../interfaces/project';
import { ProjectService } from '../../../services/project.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { splitIncludes, joinIncludes } from '../../../utils/string.utils';

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
        data: ['', [Validators.required]],
      }),
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.isEdit = !!this.id;
      if (this.isEdit) {
        this.projectService.getProject(this.id!).subscribe(
          (response: any) => {
            // Convert includes string to array using utility function
            const includesAr = Array.isArray(response.includesAr)
              ? response.includesAr
              : splitIncludes(response.includesAr);
            const includesEn = Array.isArray(response.includesEn)
              ? response.includesEn
              : splitIncludes(response.includesEn);

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
              nameAr: response.nameAr || '',
              nameEn: response.nameEn || '',
              subNameAr: response.subNameAr || '',
              subNameEn: response.subNameEn || '',
              descriptionAr: response.descriptionAr || '',
              descriptionEn: response.descriptionEn || '',
            });

            if (response.imagePath) {
              this.imagePreview.set(response.imagePath);
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
    this.fileInput.nativeElement.click();
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
        const fileName = file.name.replace(`.${fileExtension}`, '');

        this.projectForm.patchValue({
          image: {
            name: fileName,
            extension: `.${fileExtension}`,
            data: base64Data,
          },
        });

        this.cdr.detectChanges();
      };

      reader.onerror = () => {
        this.hotToastService.error('Failed to read file');
      };

      reader.readAsDataURL(file);
    }
  }

  removeImage(): void {
    this.imagePreview.set(null);
    this.projectForm.patchValue({
      image: {
        name: '',
        extension: '',
        data: '',
      },
    });
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  onSubmit(): void {
    if (this.projectForm.valid) {
      const formData = this.projectForm.value as ProjectFormData;

      if (this.isEdit && this.id) {
        this.projectService.updateProject(this.id, { id: this.id, ...formData }).subscribe(
          (response: any) => {
            this.hotToastService.success('Project updated successfully');
            this.router.navigate(['/projects']);
          },
          (error: any) => {
            this.hotToastService.error('Failed to update project');
          }
        );
      } else {
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
