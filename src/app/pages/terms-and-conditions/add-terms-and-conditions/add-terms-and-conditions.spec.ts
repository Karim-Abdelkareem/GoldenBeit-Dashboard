import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddTermsAndConditions } from './add-terms-and-conditions';

describe('AddTermsAndConditions', () => {
  let component: AddTermsAndConditions;
  let fixture: ComponentFixture<AddTermsAndConditions>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddTermsAndConditions]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddTermsAndConditions);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
