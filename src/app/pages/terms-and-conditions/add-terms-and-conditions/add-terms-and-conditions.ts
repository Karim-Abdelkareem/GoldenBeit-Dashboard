import { Component, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Plus, X } from 'lucide-angular';
import { TermsAndConditionsService } from '../../../services/terms-and-conditions.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { splitIncludes } from '../../../utils/string.utils';

@Component({
  selector: 'app-add-terms-and-conditions',
  imports: [ReactiveFormsModule, CommonModule, LucideAngularModule],
  templateUrl: './add-terms-and-conditions.html',
  styleUrl: './add-terms-and-conditions.css',
})
export class AddTermsAndConditions {
  termsForm: FormGroup;
  isEdit = false;
  id: string | null = null;
  protected readonly ArrowLeft = ArrowLeft;
  protected readonly Plus = Plus;
  protected readonly X = X;

  constructor(
    private fb: FormBuilder,
    private termsService: TermsAndConditionsService,
    private hotToastService: HotToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.termsForm = this.fb.group({
      titleAr: ['', [Validators.required]],
      titleEn: ['', [Validators.required]],
      subTitleAr: [''],
      subTitleEn: [''],
      contentAr: this.fb.array([this.fb.control('', Validators.required)]),
      contentEn: this.fb.array([this.fb.control('', Validators.required)]),
    });
  }

  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.isEdit = !!this.id;
      if (this.isEdit) {
        this.termsService.getTermAndCondition(this.id!).subscribe(
          (response: any) => {
            // Split content strings using utility function
            const contentAr = Array.isArray(response.contentAr)
              ? response.contentAr
              : splitIncludes(response.contentAr);
            const contentEn = Array.isArray(response.contentEn)
              ? response.contentEn
              : splitIncludes(response.contentEn);

            // Clear existing form arrays
            while (this.contentAr.length !== 0) {
              this.contentAr.removeAt(0);
            }
            while (this.contentEn.length !== 0) {
              this.contentEn.removeAt(0);
            }

            // Add items to form arrays
            contentAr.forEach((item: string) => {
              this.contentAr.push(this.fb.control(item, Validators.required));
            });
            contentEn.forEach((item: string) => {
              this.contentEn.push(this.fb.control(item, Validators.required));
            });

            // If arrays are empty, add one empty control
            if (this.contentAr.length === 0) {
              this.contentAr.push(this.fb.control('', Validators.required));
            }
            if (this.contentEn.length === 0) {
              this.contentEn.push(this.fb.control('', Validators.required));
            }

            this.termsForm.patchValue({
              titleAr: response.titleAr || '',
              titleEn: response.titleEn || '',
              subTitleAr: response.subTitleAr || '',
              subTitleEn: response.subTitleEn || '',
            });

            this.cdr.detectChanges();
          },
          (error) => {
            console.error('Error loading term and condition:', error);
            this.hotToastService.error('Failed to load term and condition');
            this.router.navigate(['/terms-and-conditions']);
          }
        );
      }
    });
  }

  get f() {
    return this.termsForm.controls;
  }

  get contentAr(): FormArray {
    return this.termsForm.get('contentAr') as FormArray;
  }

  get contentEn(): FormArray {
    return this.termsForm.get('contentEn') as FormArray;
  }

  addContentAr(): void {
    this.contentAr.push(this.fb.control('', Validators.required));
  }

  removeContentAr(index: number): void {
    if (this.contentAr.length > 1) {
      this.contentAr.removeAt(index);
    }
  }

  addContentEn(): void {
    this.contentEn.push(this.fb.control('', Validators.required));
  }

  removeContentEn(index: number): void {
    if (this.contentEn.length > 1) {
      this.contentEn.removeAt(index);
    }
  }

  onSubmit(): void {
    if (this.termsForm.invalid) {
      this.termsForm.markAllAsTouched();
      this.hotToastService.error('Please fill in all required fields');
      return;
    }

    const formValue = { ...this.termsForm.value };
    // Content arrays are sent directly to the backend

    if (this.isEdit && this.id) {
      this.termsService.updateTermAndCondition(this.id, { id: this.id, ...formValue }).subscribe(
        (response: any) => {
          this.hotToastService.success('Term and condition updated successfully');
          this.router.navigate(['/terms-and-conditions']);
        },
        (error: any) => {
          console.error('Error updating term and condition:', error);
          this.hotToastService.error('Failed to update term and condition');
        }
      );
    } else {
      this.termsService.addTermAndCondition(formValue).subscribe(
        (response: any) => {
          this.hotToastService.success('Term and condition added successfully');
          this.router.navigate(['/terms-and-conditions']);
        },
        (error: any) => {
          console.error('Error adding term and condition:', error);
          this.hotToastService.error('Failed to add term and condition');
        }
      );
    }
  }

  goBack(): void {
    this.router.navigate(['/terms-and-conditions']);
  }
}
