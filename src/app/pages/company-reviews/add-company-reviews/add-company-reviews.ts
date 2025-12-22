import { Component, ChangeDetectorRef } from '@angular/core';
import { CompanyReviewsService } from '../../../services/company-reviews.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormGroup } from '@angular/forms';
import { HotToastService } from '@ngxpert/hot-toast';
import { CommonModule } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Star } from 'lucide-angular';
import { CompanyReviewFormData } from '../../../interfaces/company-reviews.interface';

@Component({
  selector: 'app-add-company-reviews',
  imports: [ReactiveFormsModule, CommonModule, LucideAngularModule],
  templateUrl: './add-company-reviews.html',
  styleUrl: './add-company-reviews.css',
})
export class AddCompanyReviews {
  companyReviewForm: FormGroup;
  isEdit = false;
  id: string | null = null;
  selectedRating = 0;
  protected readonly ArrowLeft = ArrowLeft;
  protected readonly Star = Star;

  constructor(
    private companyReviewsService: CompanyReviewsService,
    private fb: FormBuilder,
    private hotToastService: HotToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.companyReviewForm = this.fb.group({
      rate: [0, [Validators.required, Validators.min(1), Validators.max(5)]],
      review: ['', [Validators.required]],
    });

    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.isEdit = !!this.id;
      if (this.isEdit) {
        this.companyReviewsService.getCompanyReview(this.id!).subscribe(
          (response: any) => {
            this.companyReviewForm.patchValue({
              rate: response.rate || 0,
              review: response.review || '',
            });
            this.selectedRating = response.rate || 0;
            this.cdr.detectChanges();
          },
          (error: any) => {
            this.hotToastService.error('Failed to get company review');
          }
        );
      }
    });
  }

  setRating(rating: number): void {
    this.selectedRating = rating;
    this.companyReviewForm.patchValue({ rate: rating });
  }

  onSubmit(): void {
    if (this.companyReviewForm.valid) {
      const formData: CompanyReviewFormData = this.companyReviewForm.value;
      if (this.isEdit) {
        this.companyReviewsService.updateCompanyReview(this.id!, formData).subscribe(
          (response: any) => {
            this.hotToastService.success('Company review updated successfully');
            this.router.navigate(['/company-reviews']);
          },
          (error: any) => {
            this.hotToastService.error('Failed to update company review');
          }
        );
      } else {
        this.companyReviewsService.addCompanyReview(formData).subscribe(
          (response: any) => {
            this.hotToastService.success('Company review added successfully');
            this.router.navigate(['/company-reviews']);
          },
          (error: any) => {
            this.hotToastService.error('Failed to add company review');
          }
        );
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.companyReviewForm.controls).forEach((key) => {
        const control = this.companyReviewForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
    }
  }

  get f() {
    return this.companyReviewForm.controls;
  }

  goBack(): void {
    this.router.navigate(['/company-reviews']);
  }
}
