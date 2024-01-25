import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RaViolationsComponent } from './ra-violations.component';

describe('RaViolationsComponent', () => {
  let component: RaViolationsComponent;
  let fixture: ComponentFixture<RaViolationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ RaViolationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RaViolationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
