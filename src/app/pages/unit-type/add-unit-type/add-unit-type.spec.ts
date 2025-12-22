import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddUnitType } from './add-unit-type';

describe('AddUnitType', () => {
  let component: AddUnitType;
  let fixture: ComponentFixture<AddUnitType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddUnitType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddUnitType);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
