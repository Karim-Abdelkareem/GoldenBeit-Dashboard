import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EstateUnit } from './estate-unit';

describe('EstateUnit', () => {
  let component: EstateUnit;
  let fixture: ComponentFixture<EstateUnit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EstateUnit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstateUnit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
