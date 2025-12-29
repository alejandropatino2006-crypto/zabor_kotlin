import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BestSalesByItemComponent } from './best-sales-by-item.component';

describe('BestSalesByItemComponent', () => {
  let component: BestSalesByItemComponent;
  let fixture: ComponentFixture<BestSalesByItemComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BestSalesByItemComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BestSalesByItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
