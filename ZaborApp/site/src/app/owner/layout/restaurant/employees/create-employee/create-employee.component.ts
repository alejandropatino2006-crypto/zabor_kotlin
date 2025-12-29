import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';

import { RestaurantService } from 'src/app/shared/services/restaurant.service';
import { MustMatch, noOnlyWhitespaceValidator } from "../../../../../shared/helpers/custom.validator";
import * as Swaldata from '../../../../../shared/helpers/swalFunctionsData';
import { createEmployeeAccessCodeValidatorFn, createPasswordExistenceValidatorFn } from '../employees.form.validators';

@Component({
  selector: 'app-create-employee',
  templateUrl: './create-employee.component.html',
  styleUrls: ['./create-employee.component.scss']
})
export class CreateEmployeeComponent implements OnInit {

  employeeForm: FormGroup;
  jobTitles: any = [];
  restaurantId: number;
  loggedInUser_Id = localStorage.getItem("currentUserId");

  subRoles = [
    // "waiter", "kiosk", "cashier", "pos", "other"
    { id: 1, name: "waiter" },
    { id: 2, name: "kiosk" },
    { id: 3, name: "cashier" },
    { id: 4, name: "pos" },
    { id: 5, name: "other" }
  ];

  constructor(
    private _router: Router,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private restaurantService: RestaurantService,
    private route: ActivatedRoute,
  ) { }

  translateSubRoleId(id: number) {
    return this.subRoles.find(x => x.id == id).name;
  }

  ngOnInit() {
    this.getJobTitles();
    this.restaurantId = parseInt(this.route.snapshot.paramMap.get("restid"));
    this.employeeForm = this.formBuilder.group({
      name: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(60)]],
      phone: ["", [Validators.required, Validators.maxLength(15), Validators.minLength(10)]],
      email: ["", [Validators.required, Validators.email]],
      status: ["", [Validators.required]],
      // password: ["", [Validators.required, Validators.minLength(6)]],
      password: this.formBuilder.control(
        "",
        {
          validators: [Validators.required, noOnlyWhitespaceValidator, Validators.minLength(6)],
          // createEmployeeAccessCodeValidatorFn returns async validator which is now enabled due to the value of formDateLoaded argument being true
          asyncValidators: [createPasswordExistenceValidatorFn(this.restaurantService, { restaurantId: this.restaurantId, employeeId: 0 }, true)],
          updateOn: 'blur',
        }
      ),
      confirmPassword: ["", Validators.required],
      job_title: ["", [Validators.required, Validators.maxLength(10)]],
      tax_account_number: ["", Validators.required],
      social_security: ["", Validators.required],
      address: ["", Validators.required],
      city: ["", Validators.required],
      postal_code: ["", Validators.required],
      employee_notes: ["", Validators.required],
      hired_date: ["", Validators.required],
      dob: ["", Validators.required],
      terminated_date: [""],
      pay_basis: ["", Validators.required],
      pay_rate: ["", Validators.required],
      tips_received: ["N"],
      use_hostess_features: ["N"],
      schedule_not_enforced: ["N"],
      is_a_server: ["N"],
      cannot_finalise_cashier_out: ["N"],
      allow_create_or_reply_emails: ["N"],
      disallow_create_edit_dine_in_orders: ["N"],
      disallow_create_edit_bar_tab_orders: ["N"],
      disallow_create_edit_take_out_orders: ["N"],
      disallow_create_edit_drive_thru_orders: ["N"],
      disallow_create_edit_delivery_orders: ["N"],
      driving_license_number: [""],
      driving_license_expires: [""],
      car_insurance_career: [""],
      insurance_policy_number: [""],
      insurance_policy_expires: [""],
      insurance_policy_notes: [""],
      is_driver: ["N"],
      pref_lang: ["en", Validators.required],
      order_entry_sec_lang: ["N"],
      msr_card: [""],
      // access_code: ["", Validators.required],
      access_code: this.formBuilder.control(
        "",
        {
          validators: [Validators.required, noOnlyWhitespaceValidator, Validators.minLength(1)],
          // createEmployeeAccessCodeValidatorFn returns async validator which is now enabled due to the value of formDateLoaded argument being true
          asyncValidators: [createEmployeeAccessCodeValidatorFn(this.restaurantService, { restaurantId: this.restaurantId, employeeId: 0 }, true)],
          updateOn: 'blur',
        }
      ),
      security_level: [""],
      holiday_pay_scale: [""],
      sub_role_id: ["", Validators.required],
      access_delivery_status: ["N", Validators.required],
      access_drivers_status: ["N", Validators.required],
      adjust_price_in_order_entry: ["N", Validators.required],
      approve_cash_register_discrepancy: ["N", Validators.required],
      access_back_office: ["N", Validators.required],
      cash_discount_amount_entry: ["N", Validators.required],
      discounts: ["N", Validators.required],
      create_new_orders: ["N", Validators.required],
      cash_register_access: ["N", Validators.required],
      server_access: ["N", Validators.required],
      refund: ["N", Validators.required],
      pay_out: ["N", Validators.required],
      reprint: ["N", Validators.required],
      void: ["N", Validators.required],
      close_shift: ["N", Validators.required],
    },
      {
        validator: MustMatch("password", "confirmPassword")
      });

    // Subscribe to password control valueChanges
    // this.employeeForm.get('password').valueChanges.subscribe(password => {
    //   if (password) {
    //     this.checkEmployeePasswordAlreadyExist(password);
    //   } else {
    //     // Reset password error if the field is empty
    //     this.employeeForm.get('password').setErrors(null);
    //   }
    // });
    // this.employeeForm.get('access_code').valueChanges.subscribe(code => {
    //   if (code) {
    //     if (code.toString().length < 6) {
    //       console.log("access code is less than 6");
    //       this.employeeForm.get('access_code').setErrors({ minlength: true })
    //     } else {
    //       this.checkEmployeeAccessCodeAlreadyExist(code);
    //     }
    //   } else {
    //     // Reset password error if the field is empty
    //     this.employeeForm.get('access_code').setErrors(null);
    //   }
    // });
  }

  // checkEmployeeAccessCodeAlreadyExist(code: number) {
  //   this.spinner.show();
  //   this.restaurantService.checkEmployeeAccessCodeExists({ access_code: code, rest_id: this.restaurantId })
  //     .pipe(
  //       map(response => {
  //         if (response.status) {
  //           return { AccessCodeExists: false };
  //         } else {
  //           return { AccessCodeExists: true };
  //         }
  //       }),
  //       catchError(() => of({ AccessCodeExists: true })),
  //       finalize(() => this.spinner.hide())
  //     )
  //     .subscribe(result => {
  //       if (result.AccessCodeExists) {
  //         this.employeeForm.get('access_code').setErrors({ AccessCodeExists: true });
  //       } else {
  //         // Handle the case where the password does not exist
  //         // You can implement your desired logic here
  //         console.log('Access Code does not exist');
  //       }
  //     });
  // }

  // checkEmployeePasswordAlreadyExist(password: string) {
  //   // Call your service to check password existence with restaurantId
  //   this.restaurantService.checkEmployeePasswordExists({ password: password, rest_id: this.restaurantId, userid:"" })
  //     .pipe(
  //       map(response => {
  //         if (response.status) {
  //           return { passwordExists: false };
  //         } else {
  //           return { passwordExists: true };
  //         }
  //       }),
  //       catchError(() => of({ passwordExists: true })) // Handle errors as password exists
  //     )
  //     .subscribe(result => {
  //       if (result.passwordExists) {
  //         this.employeeForm.get('password').setErrors({ passwordExists: true });
  //       } else {
  //         // Handle the case where the password does not exist
  //         // You can implement your desired logic here
  //         console.log('Password does not exist');
  //       }
  //     });
  // }

  getJobTitles() {
    this.spinner.show();
    this.restaurantService.getJobTitles().subscribe(response => {
      console.log("returned job titles data: ", response);
      if (response.status) {
        const responseData = response.data;
        console.log("returned job titles data: ", responseData);
        this.jobTitles = responseData.list;
        console.log("job titles: ", this.jobTitles);
      }
      else
        Swal.fire(Swaldata.SwalErrorToast(response.msg));
    }, error => {
      Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("There seems to be an issue with retrieving the job titles.")));
      this._router.navigate(['/owner/restaurants']);
    }).add(() => {
      this.spinner.hide();
    })

  }

  onSubmit() {
    console.log(this.employeeForm)
    if (this.employeeForm.invalid) {
      console.log(this.employeeForm)
      return;
    }

    // cleanForm(this.restaurantForm);


    this.spinner.show();

    var formData = new FormData();
    Object.entries(this.employeeForm.value).forEach(
      ([key, value]: any[]) => {
        formData.set(key, value);
      }
    )

    //formData.set('last_update_date', new Date().toISOString().slice(0, 19).replace('T', ' '));
    formData.set('restid', this.restaurantId.toString());
    // formData.set('userid', this.loggedInUser_Id.toString());
    formData.set('ownerUserId', this.loggedInUser_Id.toString());
    formData.set('sub_role', this.translateSubRoleId(this.employeeForm.value.sub_role_id));
    formData.delete('sub_role_id');
    formData.delete('confirmPassword');


    this.restaurantService.createEmployee(formData).subscribe(
      data => {
        if (data.status) {
          Swal.fire(Swaldata.SwalSuccessToast(data.msg));
          this._router.navigate(['/owner/restaurants/employee/', this.restaurantId.toString()]);
        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.msg));
        }
      },
      error => {
        Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("There seems to be a problem with the employee data you entered. Please double-check the information and try again.")));
      }
    ).add(() => {
      this.spinner.hide();
    });
  }

  get getAccessCodeErrors() {
    const accessCodeFormControl: AbstractControl = this.employeeForm.controls['access_code'];
    const errors = accessCodeFormControl.errors;
    if (errors) {
      if (accessCodeFormControl.hasError('required')) {
        return "required";
      }
      if (accessCodeFormControl.hasError('whitespace')) {
        return "whitespace";
      }
      if (accessCodeFormControl.hasError('AccessCodeExists')) {
        return "AccessCodeExists";
      }
      if (accessCodeFormControl.hasError('minlength')) {
        return "minlength";
      }
      return "unknown";
    }
     return null;
  }

  get getPasswordErrors() {
    const passwordFormControl: AbstractControl = this.employeeForm.controls['password'];
    const errors = passwordFormControl.errors;
    if (errors) {
      if (passwordFormControl.hasError('required')) {
        return "required";
      }
      if (passwordFormControl.hasError('whitespace')) {
        return "whitespace";
      }
      if (passwordFormControl.hasError('passwordExists')) {
        return "passwordExists";
      }
      if (passwordFormControl.hasError('minlength')) {
        return "minlength";
      }
      return "unknown";
    }
     return null;
  }

}
