import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArticleCategory } from './article-category';

describe('ArticleCategory', () => {
  let component: ArticleCategory;
  let fixture: ComponentFixture<ArticleCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArticleCategory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArticleCategory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
