import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrowdCountViolationsComponent } from './crowd-count-violations.component';

describe('CrowdCountViolationsComponent', () => {
  let component: CrowdCountViolationsComponent;
  let fixture: ComponentFixture<CrowdCountViolationsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CrowdCountViolationsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CrowdCountViolationsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
