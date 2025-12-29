import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LangRadioComponent } from './lang-radio.component';

describe('LangRadioComponent', () => {
  let component: LangRadioComponent;
  let fixture: ComponentFixture<LangRadioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LangRadioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LangRadioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
