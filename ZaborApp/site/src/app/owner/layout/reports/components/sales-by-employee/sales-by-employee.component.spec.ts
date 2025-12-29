import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesByEmployeeComponent } from './sales-by-employee.component';

describe('SalesByEmployeeComponent', () => {
  let component: SalesByEmployeeComponent;
  let fixture: ComponentFixture<SalesByEmployeeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesByEmployeeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesByEmployeeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
