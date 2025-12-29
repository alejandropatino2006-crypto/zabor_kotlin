import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesByBartagComponent } from './sales-by-bartag.component';

describe('SalesByBartagComponent', () => {
  let component: SalesByBartagComponent;
  let fixture: ComponentFixture<SalesByBartagComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SalesByBartagComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SalesByBartagComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
