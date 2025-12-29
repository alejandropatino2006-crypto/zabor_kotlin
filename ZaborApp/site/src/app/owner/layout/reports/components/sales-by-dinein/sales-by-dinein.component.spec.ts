import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesByDineinComponent } from './sales-by-dinein.component';

describe('SalesByDineinComponent', () => {
  let component: SalesByDineinComponent;
  let fixture: ComponentFixture<SalesByDineinComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesByDineinComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesByDineinComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
