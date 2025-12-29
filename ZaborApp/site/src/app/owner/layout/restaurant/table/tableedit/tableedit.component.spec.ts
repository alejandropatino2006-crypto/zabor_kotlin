import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TableeditComponent } from './tableedit.component';

describe('TableeditComponent', () => {
  let component: TableeditComponent;
  let fixture: ComponentFixture<TableeditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TableeditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TableeditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
