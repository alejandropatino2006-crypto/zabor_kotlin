import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateReaderComponent } from './create-reader.component';

describe('CreateReaderComponent', () => {
  let component: CreateReaderComponent;
  let fixture: ComponentFixture<CreateReaderComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateReaderComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateReaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
