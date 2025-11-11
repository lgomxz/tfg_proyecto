import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TooltipMathComponent } from './tooltip-math.component';

describe('TooltipMathComponent', () => {
  let component: TooltipMathComponent;
  let fixture: ComponentFixture<TooltipMathComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TooltipMathComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TooltipMathComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
