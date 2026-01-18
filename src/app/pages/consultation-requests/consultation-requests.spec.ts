import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConsultationRequests } from './consultation-requests';

describe('ConsultationRequests', () => {
  let component: ConsultationRequests;
  let fixture: ComponentFixture<ConsultationRequests>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConsultationRequests]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConsultationRequests);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
