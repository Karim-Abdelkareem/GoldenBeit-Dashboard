import { Component, ViewChild, ElementRef, signal, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import {
  ArticleFormData,
  ArticleCategoryUpdateFormData,
} from '../../../interfaces/article.interface';
import { ArticlesCategoryService } from '../../../services/articles-category.service';
import { ArticlesService } from '../../../services/articles.service';
import { HotToastService } from '@ngxpert/hot-toast';
import { ActivatedRoute, Router } from '@angular/router';
import { processImageInput, getEmptyImageData } from '../../../utils/image.utils';
import { environment } from '../../../environment/environment';
@Component({
  selector: 'app-add-articles',
  imports: [ReactiveFormsModule, CommonModule],
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
  currentImagePath: string | null = null;
  hasNewImage = false;
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

            // Store the current image path and display it
            if (response.imagePath) {
              this.currentImagePath = response.imagePath;
              this.imagePreview.set(`${environment.imageUrl}${response.imagePath}`);
            }

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
        this.hasNewImage = true;

        // Update form with image data
        this.articleForm.patchValue({
          image: {
            name: result.name,
            extension: result.extension,
            data: result.data, // Full data URI format: data:image/<type>,<data>
          },
        });
      } else {
        // If no file selected, restore preview to current image if in edit mode
        if (this.isEdit && this.currentImagePath) {
          this.imagePreview.set(`${environment.imageUrl}${this.currentImagePath}`);
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
        this.imagePreview.set(`${environment.imageUrl}${this.currentImagePath}`);
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
        // Prepare update data
        const updateData: any = {
          id: this.id!,
          titleAr: formData.titleAr,
          bodyAr: formData.bodyAr,
          titleEn: formData.titleEn,
          bodyEn: formData.bodyEn,
          order: formData.order,
          categoryId: formData.categoryId,
        };

        // Determine deleteCurrentImage value
        // If user removed image OR uploaded a new one, set deleteCurrentImage to true
        // If keeping existing image (no new image and currentImagePath still exists), set to false
        if (this.hasNewImage) {
          // User uploaded a new image - delete old and upload new
          updateData.deleteCurrentImage = true;
          updateData.image = formData.image;
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

        this.articlesService.updateArticle(this.id!, updateData).subscribe(
          (response: any) => {
            this.hotToastService.success('Article updated successfully');
            this.router.navigate(['/articles']);
          },
          (error: any) => {
            this.hotToastService.error('Failed to update article');
          }
        );
      } else {
        // For adding new article, send as before
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

  goBack(): void {
    this.router.navigate(['/articles']);
  }
}
