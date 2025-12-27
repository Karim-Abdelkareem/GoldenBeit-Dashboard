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
import { processImageInput, getEmptyImageData } from '../../../utils/image.utils';
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
            console.log(response);
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

  async onFileSelected(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    await this.handleFileSelection(input);
  }

  private async handleFileSelection(input: HTMLInputElement): Promise<void> {
    try {
      const result = await processImageInput(input);
      
      if (result) {
        // Update preview
        this.imagePreview.set(result.preview);

        // Update form with image data
        this.articleForm.patchValue({
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
    const emptyImage = getEmptyImageData();
    this.articleForm.patchValue({
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
    if (this.articleForm.valid) {
      const formData: ArticleFormData = this.articleForm.value;
      if (this.isEdit) {
        this.articlesService.updateArticle(this.id!, { id: this.id!, ...formData }).subscribe(
          (response: any) => {
            this.hotToastService.success('Article updated successfully');
            this.router.navigate(['/articles']);
          },
          (error: any) => {
            this.hotToastService.error('Failed to update article');
          }
        );
      } else {
        this.articlesService.addArticle(formData).subscribe(
          (response: any) => {
            this.hotToastService.success('Article added successfully');
            this.router.navigate(['/articles']);
          },
          (error: any) => {
            this.hotToastService.error('Failed to add article');
          }
        );
      }
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
