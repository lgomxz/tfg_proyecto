import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SingleSampleComponent } from './single-sample.component';

describe('SingleSampleComponent', () => {
  let component: SingleSampleComponent;
  let fixture: ComponentFixture<SingleSampleComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SingleSampleComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SingleSampleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
