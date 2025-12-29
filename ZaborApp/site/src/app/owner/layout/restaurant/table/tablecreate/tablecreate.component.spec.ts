import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TablecreateComponent } from './tablecreate.component';

describe('TablecreateComponent', () => {
  let component: TablecreateComponent;
  let fixture: ComponentFixture<TablecreateComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TablecreateComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TablecreateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
