import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmailHeaderListComponent } from './email-header-list.component';

describe('EmailHeaderListComponent', () => {
  let component: EmailHeaderListComponent;
  let fixture: ComponentFixture<EmailHeaderListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmailHeaderListComponent],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(EmailHeaderListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
