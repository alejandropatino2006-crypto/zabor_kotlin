import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesByDeliveryComponent } from './sales-by-delivery.component';

describe('SalesByDeliveryComponent', () => {
  let component: SalesByDeliveryComponent;
  let fixture: ComponentFixture<SalesByDeliveryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesByDeliveryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesByDeliveryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
