import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TotalSalesByShiftComponent } from './total-sales-by-shift.component';

describe('TotalSalesByShiftComponent', () => {
  let component: TotalSalesByShiftComponent;
  let fixture: ComponentFixture<TotalSalesByShiftComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TotalSalesByShiftComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TotalSalesByShiftComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
