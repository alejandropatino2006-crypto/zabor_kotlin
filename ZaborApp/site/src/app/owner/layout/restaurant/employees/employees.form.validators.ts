import { AbstractControl, AsyncValidatorFn, ValidationErrors } from '@angular/forms';
import { Observable } from 'rxjs';

import { RestaurantService } from '../../../../shared/services/restaurant.service';

// export function validateEmployeeAccessCode(control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
//   if (control == null) return Promise.resolve(null);
//   console.log("access code value for checking: ", control.value);
//   const isAllWhitespaceOrEmpty = (control.value || '').trim().length === 0;
//   if (isAllWhitespaceOrEmpty) {
//     return Promise.resolve(null);
//   }
//   return Promise.resolve({ 'AccessCodeExists': true });
// }

export function createEmployeeAccessCodeValidatorFn(restaurantService: RestaurantService, { restaurantId, employeeId }: { restaurantId: number; employeeId: number }, formDataLoaded = false): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    if (!formDataLoaded) return Promise.resolve(null);
    // return validateEmployeeAccessCode(control);

    if (control == null) return Promise.resolve(null);
    const controlValue = typeof control.value !== 'string' ? String(control.value) : control.value;
    console.log("access code value for checking: ", controlValue);
    const isAllWhitespaceOrEmpty = (controlValue || '').trim().length === 0;
    if (isAllWhitespaceOrEmpty) {
      return Promise.resolve(null);
    }

    return new Promise<ValidationErrors | null>((resolve, reject) => {
      restaurantService.checkEmployeeAccessCodeExists({ access_code: controlValue, rest_id: restaurantId, userid: employeeId < 1 ? undefined : employeeId })
        .subscribe(response => {
          if (response.status) {
            return resolve(null);
          } else {
            console.error("Access code (same value) already exists");
            return resolve({ 'AccessCodeExists': true });
          }
        });
    });
  };
}

export function createPasswordExistenceValidatorFn(restaurantService: RestaurantService, { restaurantId, employeeId }: { restaurantId: number; employeeId: number }, formDataLoaded = false): AsyncValidatorFn {
  return (control: AbstractControl): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> => {
    if (!formDataLoaded) return Promise.resolve(null);

    if (control == null) return Promise.resolve(null);
    const controlValue = typeof control.value !== 'string' ? String(control.value) : control.value;
    console.log("password value for checking: ", controlValue);
    const isAllWhitespaceOrEmpty = (controlValue || '').trim().length === 0;
    if (isAllWhitespaceOrEmpty) {
      return Promise.resolve(null);
    }

    return new Promise<ValidationErrors | null>((resolve, reject) => {
      restaurantService.checkEmployeePasswordExists({ password: controlValue, rest_id: restaurantId, userid: employeeId < 1 ? undefined : employeeId })
        .subscribe(response => {
          if (response.status) {
            return resolve(null);
          } else {
            console.error("Password (same value) already exists");
            return resolve({ 'passwordExists': true });
          }
        });
    });
  };
}
