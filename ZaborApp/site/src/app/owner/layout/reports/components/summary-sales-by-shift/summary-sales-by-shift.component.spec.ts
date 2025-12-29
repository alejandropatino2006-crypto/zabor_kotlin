import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummarySalesByShiftComponent } from './summary-sales-by-shift.component';

describe('SummarySalesByShiftComponent', () => {
  let component: SummarySalesByShiftComponent;
  let fixture: ComponentFixture<SummarySalesByShiftComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummarySalesByShiftComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummarySalesByShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
