import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UnitRequest } from './unit-request';

describe('UnitRequest', () => {
  let component: UnitRequest;
  let fixture: ComponentFixture<UnitRequest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UnitRequest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UnitRequest);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
