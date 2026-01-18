import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstateUnitDetails } from './estate-unit-details';

describe('EstateUnitDetails', () => {
  let component: EstateUnitDetails;
  let fixture: ComponentFixture<EstateUnitDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstateUnitDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstateUnitDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
