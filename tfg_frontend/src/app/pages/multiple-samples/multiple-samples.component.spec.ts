import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MultipleSamplesComponent } from './multiple-samples.component';

describe('MultipleSamplesComponent', () => {
  let component: MultipleSamplesComponent;
  let fixture: ComponentFixture<MultipleSamplesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MultipleSamplesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MultipleSamplesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
