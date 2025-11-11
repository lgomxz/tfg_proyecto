import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LegalContentComponent } from './legal-content.component';

describe('LegalContentComponent', () => {
  let component: LegalContentComponent;
  let fixture: ComponentFixture<LegalContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LegalContentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LegalContentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
