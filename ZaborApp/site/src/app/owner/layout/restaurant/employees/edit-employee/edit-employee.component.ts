import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, AbstractControl } from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from "sweetalert2";

import { RestaurantService } from "src/app/shared/services/restaurant.service";
import { noOnlyWhitespaceValidator } from '../../../../../shared/helpers/custom.validator';
import * as Swaldata from "../../../../../shared/helpers/swalFunctionsData";
import { createEmployeeAccessCodeValidatorFn } from '../employees.form.validators';

@Component({
  selector: 'app-edit-employee',
  templateUrl: './edit-employee.component.html',
  styleUrls: ['./edit-employee.component.scss'],
})
export class EditEmployeeComponent implements OnInit {

  employeeForm: FormGroup;
  jobTitles: any = [];
  restaurantId: number;
  loggedInUser_Id = localStorage.getItem("currentUserId");
  employeeId: number;

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
    return this.subRoles.find(x => x.id === id).name;
  }

  translateSubRoleName(name: string) {
    if (name == null || name === '')
      return 5;
    return this.subRoles.find(x => x.name === name.replace('_user', '')).id;
  }

  ngOnInit() {
    this.getJobTitles();
    this.employeeForm = this.formBuilder.group({
      name: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(60)]],
      email: this.formBuilder.control("", [Validators.required, Validators.email]),
      phone: ["", [Validators.required, Validators.maxLength(15), Validators.minLength(10)]],
      status: ["", [Validators.required]],
      job_title: ["", [Validators.required, Validators.maxLength(10)]],
      tax_account_number: ["", [Validators.required]],
      social_security: ["", [Validators.required]],
      address: ["", [Validators.required]],
      city: ["", [Validators.required]],
      postal_code: ["", [Validators.required]],
      employee_notes: ["", [Validators.required]],
      hired_date: ["", [Validators.required]],
      dob: ["", [Validators.required]],
      terminated_date: [""],
      pay_basis: ["", [Validators.required]],
      pay_rate: ["", [Validators.required]],
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
      pref_lang: ["en", [Validators.required]],
      order_entry_sec_lang: ["N"],
      msr_card: [""],
      // access_code: ["", [Validators.required]],
      access_code: this.formBuilder.control(
        "",
        {
          validators: [Validators.required, noOnlyWhitespaceValidator, Validators.minLength(1)],
          // asyncValidators: [validateEmployeeAccessCode],
          // createEmployeeAccessCodeValidatorFn returns async validator which will not run due to the value of formDateLoaded argument being false
          asyncValidators: [createEmployeeAccessCodeValidatorFn(this.restaurantService, { restaurantId: this.restaurantId, employeeId: this.employeeId }, false)],
          // updateOn: 'submit',
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

    });
    this.restaurantId = parseInt(this.route.snapshot.paramMap.get("restid"));
    this.employeeId = parseInt(this.route.snapshot.paramMap.get("id"));
    this.loadData();
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
  //   this.restaurantService.checkEmployeeAccessCodeExists({ access_code: code, rest_id: this.restaurantId, userid:this.employeeId })
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

  private loadData() {
    this.restaurantService
      .getEmployee(this.employeeId)
      .subscribe(
        (response) => {
          console.log("employee data: ", response.data);
          if (response.status) {
            // const employeeUserData = response.data.user[0];
            // const employeeData = response.data.employee[0];
            const employeeUserData = response.data.user;
            const employeeData = response.data.employee;
            this.employeeForm.patchValue({
              name: employeeUserData.name,
              email: employeeUserData.email,
              // password: employeeUserData.password,
              phone: employeeUserData.phone,
              status: employeeUserData.status,
              job_title: employeeData.job_title,
              tax_account_number: employeeData.tax_account_number,
              social_security: employeeData.social_security,
              address: employeeUserData.address,
              inventory_vendor: employeeData.inventory_vendor,
              city: employeeUserData.city,
              postal_code: employeeUserData.postal_code,
              employee_notes: employeeData.employee_notes,
              hired_date: employeeData.hired_date,
              dob: employeeUserData.dob,
              terminated_date: employeeData.terminated_date,
              pay_basis: employeeData.pay_basis,
              pay_rate: employeeData.pay_rate,
              tips_received: employeeData.tips_received,
              use_hostess_features: employeeData.use_hostess_features,
              schedule_not_enforced: employeeData.schedule_not_enforced,
              is_a_server: employeeData.is_a_server,
              cannot_finalise_cashier_out: employeeData.cannot_finalise_cashier_out,
              allow_create_or_reply_emails: employeeData.allow_create_or_reply_emails,
              disallow_create_edit_dine_in_orders: employeeData.disallow_create_edit_dine_in_orders,
              disallow_create_edit_bar_tab_orders: employeeData.disallow_create_edit_bar_tab_orders,
              disallow_create_edit_take_out_orders: employeeData.disallow_create_edit_take_out_orders,
              disallow_create_edit_drive_thru_orders: employeeData.disallow_create_edit_drive_thru_orders,
              disallow_create_edit_delivery_orders: employeeData.disallow_create_edit_delivery_orders,
              driving_license_number: employeeData.driving_license_number,
              driving_license_expires: employeeData.driving_license_expires,
              car_insurance_career: employeeData.car_insurance_career,
              insurance_policy_number: employeeData.insurance_policy_number,
              insurance_policy_expires: employeeData.insurance_policy_expires,
              insurance_policy_notes: employeeData.insurance_policy_notes,
              is_driver: employeeData.is_driver,
              pref_lang: employeeUserData.pref_lang,
              order_entry_sec_lang: employeeData.order_entry_sec_lang,
              msr_card: employeeData.msr_card,
              access_code: employeeData.access_code,
              security_level: employeeData.security_level,
              holiday_pay_scale: employeeData.holiday_pay_scale,
              sub_role_id: this.translateSubRoleName(employeeData.sub_role),
              access_delivery_status: employeeData.access_delivery_status,
              access_drivers_status: employeeData.access_drivers_status,
              adjust_price_in_order_entry: employeeData.adjust_price_in_order_entry,
              approve_cash_register_discrepancy: employeeData.approve_cash_register_discrepancy,
              access_back_office: employeeData.access_back_office,
              cash_discount_amount_entry: employeeData.cash_discount_amount_entry,
              discounts: employeeData.discounts,
              create_new_orders: employeeData.create_new_orders,
              cash_register_access: employeeData.cash_register_access,
              server_access: employeeData.server_access,
              refund: employeeData.refund,
              pay_out: employeeData.pay_out,
              reprint: employeeData.reprint,
              void: employeeData.void,
              close_shift: employeeData.close_shift,
            });

            this.employeeForm.controls['email'].disable();
            // this.employeeForm.controls['password'].disable();
            // this.employeeForm.controls['name'].readOnly = true;

            // recreate async validator for access_code
            // createEmployeeAccessCodeValidatorFn returns async validator which is now enabled due to the value of formDateLoaded argument being true
            this.employeeForm.get('access_code').setAsyncValidators([createEmployeeAccessCodeValidatorFn(this.restaurantService, { restaurantId: this.restaurantId, employeeId: this.employeeId }, true)]);
            this.employeeForm.get('access_code').updateValueAndValidity();
          } else {
            Swal.fire(
              Swaldata.SwalErrorToast(
                this.translate.instant("Employee not found")
              )
            );
            this._router.navigate([
              "/owner/restaurants/employee/",
              this.restaurantId.toString(),
            ]);
          }
        },
        (error) => {
          Swal.fire(
            Swaldata.SwalErrorToast(
              this.translate.instant("Employee not found")
            )
          );
        }
      )
      .add(() => {
        this.spinner.hide();
      });
  }

  onSubmit1() {
    console.log('Submitting', this.employeeForm);
    // if (this.employeeForm.untouched) {
    //   // force validators to run
    //   this.employeeForm.updateValueAndValidity();
    // }

    // give time for async validators to run and change the form validity after submit button is clicked
    setTimeout(() => {
      if (this.employeeForm.invalid) {
        console.log('Submit error', this.employeeForm);

        // code to change updateOn to 'blur' for access_code from 'submit'
        const oldControl = this.employeeForm.get('access_code');
        const newControl = this.formBuilder.control(oldControl.value, {
          validators: [Validators.required, noOnlyWhitespaceValidator, Validators.minLength(6)],
          asyncValidators: [createEmployeeAccessCodeValidatorFn(this.restaurantService, { restaurantId: this.restaurantId, employeeId: this.employeeId })],
          updateOn: 'blur'
        });
        this.employeeForm.setControl('access_code', newControl);
        return;
      }

      this.spinner.show();
      this.doSubmit();
    }, 1000);
  }

  onSubmit() {
    console.log('Submitting', this.employeeForm);

    if (this.employeeForm.invalid) {
      console.log('Submit error', this.employeeForm);
      return;
    }

    this.spinner.show();
    this.doSubmit();
  }

  private doSubmit() {
    // cleanForm(this.restaurantForm);

    var formData = new FormData();
    Object.entries(this.employeeForm.value).forEach(([key, value]: any[]) => {
      formData.set(key, value);
    });

    // formData.set(
    //   "last_update_date",
    //   new Date().toISOString().slice(0, 19).replace("T", " ")
    // );
    // formData.set("restid", this.restaurantId.toString());
    formData.set("employeeID", this.employeeId.toString());
    formData.set('sub_role', this.translateSubRoleId(this.employeeForm.value.sub_role_id));
    formData.delete('sub_role_id');

    this.restaurantService
      .saveEmployee(formData)
      .subscribe(
        (data) => {
          if (data.status) {
            Swal.fire(Swaldata.SwalSuccessToast(data.msg));
            this._router.navigate([
              "/owner/restaurants/employee/",
              this.restaurantId.toString(),
            ]);
          } else {
            Swal.fire(Swaldata.SwalErrorToast(data.msg));
          }
        },
        (error) => {
          Swal.fire(
            Swaldata.SwalErrorToast(
              this.translate.instant("Not Able to edit Employee")
            )
          );
        }
      )
      .add(() => {
        this.spinner.hide();
      });
  }

  get getAccessCodeErrors() {
    const accessCodeFormControl: AbstractControl = this.employeeForm.controls['access_code'];
    const errors = accessCodeFormControl.errors;
    if (errors) {
      // if (errors['required']) {
      if (accessCodeFormControl.hasError('required')) {
        return "required";
      }
      // if (errors['whitespace']) {
      if (accessCodeFormControl.hasError('whitespace')) {
        return "whitespace";
      }
      // if (errors['AccessCodeExists']) {
      if (accessCodeFormControl.hasError('AccessCodeExists')) {
        return "AccessCodeExists";
      }
      // if (errors['minlength']) {
      if (accessCodeFormControl.hasError('minlength')) {
        return "minlength";
      }
      return "unknown";
    }
     return null;
  }

}
