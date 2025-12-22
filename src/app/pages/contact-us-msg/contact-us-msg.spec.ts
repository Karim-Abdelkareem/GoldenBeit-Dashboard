import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactUsMsg } from './contact-us-msg';

describe('ContactUsMsg', () => {
  let component: ContactUsMsg;
  let fixture: ComponentFixture<ContactUsMsg>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactUsMsg]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContactUsMsg);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
