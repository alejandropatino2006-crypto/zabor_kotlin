import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { SummarySalesByMenuGroupComponent } from './summary-sales-by-menu-group.component';

describe('SummarySalesByMenuGroupComponent', () => {
  let component: SummarySalesByMenuGroupComponent;
  let fixture: ComponentFixture<SummarySalesByMenuGroupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ SummarySalesByMenuGroupComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SummarySalesByMenuGroupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
