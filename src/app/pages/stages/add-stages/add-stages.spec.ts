import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddStages } from './add-stages';

describe('AddStages', () => {
  let component: AddStages;
  let fixture: ComponentFixture<AddStages>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddStages]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddStages);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
