import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCompanyReviews } from './add-company-reviews';

describe('AddCompanyReviews', () => {
  let component: AddCompanyReviews;
  let fixture: ComponentFixture<AddCompanyReviews>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCompanyReviews]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddCompanyReviews);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
