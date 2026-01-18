import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditEstateUnit } from './edit-estate-unit';

describe('EditEstateUnit', () => {
  let component: EditEstateUnit;
  let fixture: ComponentFixture<EditEstateUnit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditEstateUnit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditEstateUnit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
