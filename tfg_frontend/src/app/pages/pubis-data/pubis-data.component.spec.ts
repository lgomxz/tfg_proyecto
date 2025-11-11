import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PubisDataComponent } from './pubis-data.component';

describe('PubisDataComponent', () => {
  let component: PubisDataComponent;
  let fixture: ComponentFixture<PubisDataComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PubisDataComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PubisDataComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
