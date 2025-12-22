import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddArticleCategory } from './add-article-category';

describe('AddArticleCategory', () => {
  let component: AddArticleCategory;
  let fixture: ComponentFixture<AddArticleCategory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddArticleCategory]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddArticleCategory);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
