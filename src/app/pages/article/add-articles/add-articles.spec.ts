import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddArticles } from './add-articles';

describe('AddArticles', () => {
  let component: AddArticles;
  let fixture: ComponentFixture<AddArticles>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddArticles]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddArticles);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
