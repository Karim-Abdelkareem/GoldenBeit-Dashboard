import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitType } from './unit-type';

describe('UnitType', () => {
  let component: UnitType;
  let fixture: ComponentFixture<UnitType>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitType]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitType);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
