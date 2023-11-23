import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EsiUnallocatedComponent } from './esi-unallocated.component';

describe('EsiUnallocatedComponent', () => {
  let component: EsiUnallocatedComponent;
  let fixture: ComponentFixture<EsiUnallocatedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ EsiUnallocatedComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EsiUnallocatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
