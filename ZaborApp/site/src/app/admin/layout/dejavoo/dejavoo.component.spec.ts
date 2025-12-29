import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DejavooComponent } from './dejavoo.component';

describe('DejavooComponent', () => {
  let component: DejavooComponent;
  let fixture: ComponentFixture<DejavooComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DejavooComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DejavooComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
