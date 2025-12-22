import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CompanyReviews } from './company-reviews';

describe('CompanyReviews', () => {
  let component: CompanyReviews;
  let fixture: ComponentFixture<CompanyReviews>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompanyReviews]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CompanyReviews);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
