import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UsersCenterComponent } from './users-center.component';

describe('UsersCenterComponent', () => {
  let component: UsersCenterComponent;
  let fixture: ComponentFixture<UsersCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UsersCenterComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UsersCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
