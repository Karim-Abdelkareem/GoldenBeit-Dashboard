import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFaQuestion } from './add-fa-question';

describe('AddFaQuestion', () => {
  let component: AddFaQuestion;
  let fixture: ComponentFixture<AddFaQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFaQuestion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddFaQuestion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
