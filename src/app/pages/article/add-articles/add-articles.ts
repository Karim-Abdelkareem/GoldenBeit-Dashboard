import { Component, ViewChild, ElementRef, signal, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule, JsonPipe } from '@angular/common';
import {
  ArticleCategory,
  ArticleCategoryFormData,
  ArticleFormData,
  ArticleCategoryUpdateFormData,
} from '../../../interfaces/article.interface';
import { ArticlesCategoryService } from '../../../services/articles-category.service';
import { ArticlesService } from '../../../services/articles.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { ActivatedRoute, Router } from '@angular/router';
@Component({
  selector: 'app-add-articles',
  imports: [ReactiveFormsModule, CommonModule, JsonPipe],
  templateUrl: './add-articles.html',
  styleUrl: './add-articles.css',
})
export class AddArticles {
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef<HTMLInputElement>;

  articleForm: FormGroup;
  imagePreview = signal<string | null>(null);
  categories = signal<ArticleCategoryUpdateFormData[]>([]);
  isEdit = false;
  id: string | null = null;
  constructor(
    private fb: FormBuilder,
    private articlesCategoryService: ArticlesCategoryService,
    private articlesService: ArticlesService,
    private hotToastService: HotToastService,
    private router: Router,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef
  ) {
    this.route.params.subscribe((params) => {
      this.id = params['id'];
      this.isEdit = !!this.id;
      if (this.isEdit) {
        this.articlesService.getArticle(this.id!).subscribe(
          (response: any) => {
            this.articleForm.patchValue(response);
            this.cdr.detectChanges();
          },
          (error: any) => {
            this.hotToastService.error('Failed to get article');
          }
        );
      }
    });
    this.articleForm = this.fb.group({
      titleAr: ['', [Validators.required]],
      bodyAr: ['', [Validators.required]],
      titleEn: ['', [Validators.required]],
      bodyEn: ['', [Validators.required]],
      order: [1, [Validators.required, Validators.min(1)]],
      categoryId: ['', [Validators.required]],
      image: this.fb.group({
        name: [''],
        extension: [''],
        data: [''],
      }),
    });
    this.articlesCategoryService.getArticleCategories().subscribe((response: any) => {
      this.categories.set(
        response.data.map((category: any) => ({
          id: category.id,
          nameAr: category.nameAr,
          nameEn: category.nameEn,
        }))
      );
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
        // Store full data URL for preview - update immediately using signal
        this.imagePreview.set(base64String);

        // Remove data URL prefix (e.g., "data:image/png;base64,") for form data
        const base64Data = base64String.split(',')[1] || base64String;

        const fileExtension = file.name.split('.').pop() || '';
        const fileName = file.name.replace(`.${fileExtension}`, '');

        this.articleForm.patchValue({
          image: {
            name: fileName,
            extension: `.${fileExtension}`,
            data: base64Data,
          },
        });
      };

      reader.onerror = () => {
        console.error('Error reading file');
      };

      reader.readAsDataURL(file);
    } else {
      // If no file selected, clear preview
      this.imagePreview.set(null);
    }
  }

  removeImage(): void {
    this.imagePreview.set(null);
    this.articleForm.patchValue({
      image: {
        name: '',
        extension: '',
        data: '',
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
    if (this.articleForm.valid) {
      const formData: ArticleFormData = this.articleForm.value;
      if (this.isEdit) {
        this.articlesService
          .updateArticle(this.id!, { id: this.id!, ...formData })
          .subscribe((response: any) => {
            this.hotToastService.success('Article updated successfully');
            this.router.navigate(['/articles']);
          });
      } else {
        this.articlesService.addArticle(formData).subscribe((response: any) => {
          this.hotToastService.success('Article added successfully');
          this.router.navigate(['/articles']);
        });
      }
      this.articlesService.addArticle(formData).subscribe(
        (response: any) => {
          this.hotToastService.success('Article added successfully');
          this.router.navigate(['/articles']);
        },
        (error: any) => {
          this.hotToastService.error('Failed to add article');
        }
      );
      // TODO: Submit form data to your API
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.articleForm.controls).forEach((key) => {
        const control = this.articleForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
    }
  }

  get f() {
    return this.articleForm.controls;
  }

  get imageGroup() {
    return this.articleForm.get('image') as FormGroup;
  }
}
