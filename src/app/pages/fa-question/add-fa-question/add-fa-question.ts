import { ChangeDetectorRef, Component, signal } from '@angular/core';
import { FaQuestionService } from '../../../services/fa-question.service';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { LucideAngularModule, ArrowLeft, Plus, X } from 'lucide-angular';
import { FaQuestionFormData } from '../../../interfaces/fa-question';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-add-fa-question',
  imports: [ReactiveFormsModule, CommonModule, LucideAngularModule],
  templateUrl: './add-fa-question.html',
  styleUrl: './add-fa-question.css',
})
export class AddFaQuestion {
  faQuestionForm: FormGroup;
  imagePreview = signal<string | null>(null);
  isEdit = false;
  id: string | null = null;
  protected readonly ArrowLeft = ArrowLeft;
  protected readonly Plus = Plus;
  protected readonly X = X;

  constructor(
    private faQuestionService: FaQuestionService,
    private fb: FormBuilder,
    private hotToastService: HotToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.faQuestionForm = this.fb.group({
      questionAr: ['', [Validators.required]],
      questionEn: ['', [Validators.required]],
      answerAr: ['', [Validators.required]],
      answerEn: ['', [Validators.required]],
    });
  }
  ngOnInit(): void {
    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.isEdit = !!this.id;
      if (this.isEdit) {
        this.faQuestionService.getFaQuestion(this.id!).subscribe(
          (response: any) => {
            this.faQuestionForm.patchValue(response);
            this.cdr.detectChanges();
          },
          (error: any) => {
            this.hotToastService.error('Failed to load FA Question');
          }
        );
      }
    });
  }

  get f() {
    return this.faQuestionForm.controls;
  }

  onSubmit(): void {
    if (this.faQuestionForm.valid) {
      const formData = this.faQuestionForm.value as FaQuestionFormData;

      if (this.isEdit && this.id) {
        this.faQuestionService.updateFaQuestion(this.id, formData).subscribe(
          (response: any) => {
            this.hotToastService.success('FA Question updated successfully');
            this.router.navigate(['/fa-questions']);
          },
          (error: any) => {
            this.hotToastService.error('Failed to update FA Question');
          }
        );
      } else {
        this.faQuestionService.addFaQuestion(formData).subscribe(
          (response: any) => {
            this.hotToastService.success('FA Question added successfully');
            this.router.navigate(['/fa-questions']);
          },
          (error: any) => {
            this.hotToastService.error('Failed to add FA Question');
          }
        );
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.faQuestionForm.controls).forEach((key) => {
        this.faQuestionForm.get(key)?.markAsTouched();
      });
    }
  }
  goBack(): void {
    this.router.navigate(['/fa-questions']);
  }
}
