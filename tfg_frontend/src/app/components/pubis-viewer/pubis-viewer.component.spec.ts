import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PubisViewerComponent } from './pubis-viewer.component';

describe('PubisViewerComponent', () => {
  let component: PubisViewerComponent;
  let fixture: ComponentFixture<PubisViewerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PubisViewerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PubisViewerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
