import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrafficCountComponent } from './traffic-count.component';

describe('TrafficCountComponent', () => {
  let component: TrafficCountComponent;
  let fixture: ComponentFixture<TrafficCountComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrafficCountComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TrafficCountComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
