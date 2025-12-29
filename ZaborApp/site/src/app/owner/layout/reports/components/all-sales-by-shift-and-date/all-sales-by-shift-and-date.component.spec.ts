import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AllSalesByShiftAndDateComponent } from './all-sales-by-shift-and-date.component';

describe('AllSalesByShiftAndDateComponent', () => {
  let component: AllSalesByShiftAndDateComponent;
  let fixture: ComponentFixture<AllSalesByShiftAndDateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AllSalesByShiftAndDateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AllSalesByShiftAndDateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
