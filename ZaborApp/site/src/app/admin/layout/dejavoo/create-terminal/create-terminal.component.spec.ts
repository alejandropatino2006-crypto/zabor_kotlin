import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateTerminalComponent } from './create-terminal.component';

describe('CreateTerminalComponent', () => {
  let component: CreateTerminalComponent;
  let fixture: ComponentFixture<CreateTerminalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateTerminalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateTerminalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
