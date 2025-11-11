import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrainingToolComponent } from './training-tool.component';

describe('TrainingToolComponent', () => {
  let component: TrainingToolComponent;
  let fixture: ComponentFixture<TrainingToolComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrainingToolComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrainingToolComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
