import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PpeviolationComponent } from './ppeviolation.component';

describe('PpeviolationComponent', () => {
  let component: PpeviolationComponent;
  let fixture: ComponentFixture<PpeviolationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ PpeviolationComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PpeviolationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
