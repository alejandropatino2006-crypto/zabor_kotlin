import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MenuInventoryComponent } from './menu-inventory.component';

describe('MenuInventoryComponent', () => {
  let component: MenuInventoryComponent;
  let fixture: ComponentFixture<MenuInventoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MenuInventoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MenuInventoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
