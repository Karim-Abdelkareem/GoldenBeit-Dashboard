import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ArticleCategoryFormData } from '../../../interfaces/article.interface';
import { ArticlesCategoryService } from '../../../services/articles-category.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HotToastService } from '@ngxpert/hot-toast';

@Component({
  selector: 'app-add-article-category',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './add-article-category.html',
  styleUrl: './add-article-category.css',
})
export class AddArticleCategory implements OnInit {
  categoryForm: FormGroup;
  isEdit = false;
  id: string | null = null;

  constructor(
    private fb: FormBuilder,
    private articlesCategoryService: ArticlesCategoryService,
    private router: Router,
    private hotToastService: HotToastService,
    private route: ActivatedRoute
  ) {
    this.categoryForm = this.fb.group({
      nameAr: ['', [Validators.required]],
      nameEn: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'];
    if (this.id) {
      this.isEdit = true;
      this.articlesCategoryService.getArticleCategory(this.id).subscribe(
        (response: any) => {
          this.categoryForm.patchValue({
            nameAr: response.nameAr,
            nameEn: response.nameEn,
          });
        },
        (error) => {
          this.hotToastService.error('Failed to get article category');
        }
      );
    }
  }

  onSubmit(): void {
    const formData: ArticleCategoryFormData = this.categoryForm.value;
    if (this.isEdit) {
      this.articlesCategoryService
        .updateArticleCategory(this.id!, { id: this.id!, ...formData })
        .subscribe(
          (response) => {
            this.router.navigate(['/article-categories']).then(() => {
              this.hotToastService.success('Article category updated successfully');
            });
          },
          (error) => {
            this.hotToastService.error('Failed to update article category');
          }
        );
    } else {
      this.articlesCategoryService.addArticleCategory(formData).subscribe(
        (response) => {
          this.router.navigate(['/article-categories']).then(() => {
            this.hotToastService.success('Article category added successfully');
          });
        },
        (error) => {
          this.hotToastService.error('Article category added failed');
        }
      );
    }
  }

  get f() {
    return this.categoryForm.controls;
  }

  goBack(): void {
    this.router.navigate(['/article-categories']);
  }
}
