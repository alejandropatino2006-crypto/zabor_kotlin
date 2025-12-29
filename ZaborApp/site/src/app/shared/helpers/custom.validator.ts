import { FormGroup, FormControl } from "@angular/forms";
import { RestaurantService } from "../services/restaurant.service";

// custom validator to check that two fields match
export function MustMatch(controlName: string, matchingControlName: string) {
    return (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];
        const matchingControl = formGroup.controls[matchingControlName];

        if (matchingControl.errors && !matchingControl.errors.mustMatch) {
            // return if another validator has already found an error on the matchingControl
            return;
        }

        // set error on matchingControl if validation fails
        if (control.value !== matchingControl.value) {
            matchingControl.setErrors({ mustMatch: true });
        } else {
            matchingControl.setErrors(null);
        }
    };
}

export function CheckEmployeePasswordAlreadyExist(controlName: string, rest_id:number, restService:RestaurantService) {
    return async (formGroup: FormGroup) => {
        const control = formGroup.controls[controlName];

        restService.checkEmployeePasswordExists({password: control.value, rest_id}).subscribe((data: any) => {
            console.log("returned data: ", data);
            if (data.status) {
                // return true;
                //console.log("returned data: ", data);
            }
            else {
                control.setErrors({ CheckEmployeePasswordAlreadyExist: true });
            }
        }, error => {
            console.log("error: ", error);
            control.setErrors({ CheckEmployeePasswordAlreadyExist: true });
        })

        // set error on matchingControl if validation fails
        // if (control.value !== matchingControl.value) {
        //     matchingControl.setErrors({ mustMatch: true });
        // } else {
        //     matchingControl.setErrors(null);
        // }
    };}


// export function validateRequired(control: FormControl) {
//     const isEmpty = (control.value || '').length === 0;
//     const isValid = !isEmpty;
//     return isValid ? null : { 'required': true };
// }

export function noOnlyWhitespaceValidator(control: FormControl) {
    const controlValue = typeof control.value !== 'string' ? String(control.value) : control.value;
    const isWhitespace = (controlValue || '').trim().length === 0;
    const isValid = !isWhitespace;
    return isValid ? null : { 'whitespace': true };
}

export function validateTax(control: FormControl) {
    let isValid = true;
    if (Number(control.value) > 100)
        isValid = false;

    return isValid ? null : { 'taxValid': true }
}

export function addressValidator(control: FormControl) {
    // function validCharForStreetAddress(c) {
    //     return ",#-/ !@$%^*(){}|[]\\".indexOf(c) >= 0;
    // }
    const regex = /[a-zA-Z0-9,# \-\/!@$%^\*(){}|[\]\\]*/gi;
    const controlValue = (control.value || '').trim();
    // console.log('controlValue', controlValue);
    // const isValid = controlValue.length > 0 && validCharForStreetAddress(controlValue);
    const isValid = controlValue.length > 0 && regex.test(controlValue);
    console.log('isValid', isValid);
    return isValid ? null : {
        'addressValid': {
            invalidAddress: controlValue
        }
    };
}

export function noOnlyWhitespaceNotRequiredValidator(control: FormControl) {
    const controlValue = (control.value || '').trim();
    const isEmpty = controlValue.length === 0;
    const isWhitespace = controlValue.indexOf(' ') > -1;
    const isValid = isEmpty || !isWhitespace;
    return isValid ? null : { 'whitespace': true };
}

export function passcodeValidator(control: FormControl) {
    const controlValue = (control.value || '').trim();
    const isEmpty = controlValue.length === 0;
    const isWhitespace = controlValue.indexOf(' ') > -1;
    const isValid = !isEmpty && !isWhitespace;
    return isValid ? null : { 'passcode': true };
}
