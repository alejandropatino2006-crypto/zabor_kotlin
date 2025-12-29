import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomFileButtonComponent } from './custom-file-button.component';

describe('CustomFileButtonComponent', () => {
  let component: CustomFileButtonComponent;
  let fixture: ComponentFixture<CustomFileButtonComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CustomFileButtonComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CustomFileButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
