import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddConsultation } from './add-consultation';

describe('AddConsultation', () => {
  let component: AddConsultation;
  let fixture: ComponentFixture<AddConsultation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddConsultation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddConsultation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
