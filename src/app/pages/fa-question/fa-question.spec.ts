import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaQuestion } from './fa-question';

describe('FaQuestion', () => {
  let component: FaQuestion;
  let fixture: ComponentFixture<FaQuestion>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaQuestion]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaQuestion);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
