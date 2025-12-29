import { TestBed, async, inject } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';

import { OwnerAuthGuard } from './owner.auth.guard';

describe('AuthGuard', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ RouterTestingModule ],
      providers: [OwnerAuthGuard]
    });
  });

  it('should ...', inject([OwnerAuthGuard], (guard: OwnerAuthGuard) => {
    expect(guard).toBeTruthy();
  }));
});
