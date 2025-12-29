import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesByKioskComponent } from './sales-by-kiosk.component';

describe('SalesByKioskComponent', () => {
  let component: SalesByKioskComponent;
  let fixture: ComponentFixture<SalesByKioskComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesByKioskComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesByKioskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
