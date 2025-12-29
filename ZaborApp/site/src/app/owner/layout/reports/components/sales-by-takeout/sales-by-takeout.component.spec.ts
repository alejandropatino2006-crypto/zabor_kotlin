import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesByTakeoutComponent } from './sales-by-takeout.component';

describe('SalesByTakeoutComponent', () => {
  let component: SalesByTakeoutComponent;
  let fixture: ComponentFixture<SalesByTakeoutComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesByTakeoutComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesByTakeoutComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
