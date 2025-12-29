import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { routerTransition, slideToRight } from "../../router.animations";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MustMatch } from "../../shared/helpers/custom.validator";
import { AuthenticationService } from '../../shared/services/frontServices/authentication.service';
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';
import * as Swaldata from '../../shared/helpers/swalFunctionsData';

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
})
export class RegisterComponent implements OnInit {
  signupForm: FormGroup;
  submitted = false;

  constructor(
    private _router: Router,
    private formBuilder: FormBuilder,
    private _auth: AuthenticationService,
    private spinner: NgxSpinnerService

  ) { }

  ngOnInit() {
    $('body').addClass('nonepadding');
    this.signupForm = this.formBuilder.group(
      {
        name: ["", [Validators.required]],
        email: ["", [Validators.required, Validators.email]],
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required]
      },
      {
        validator: MustMatch("password", "confirmPassword")
      }
    );
  }

    // private logFormErrors() {
    //     const controls = this.signupForm.controls;
    //     for (const name in controls) {
    //         if (controls[name].invalid) {
    //             console.error('control name: ', name, ', errors: ', controls[name].errors);
    //             if (name === 'items') {
    //                 console.error((controls[name] as FormArray).length);
    //             }
    //         }
    //     }
    // }

  onSubmit() {
    if (this.signupForm.invalid) {
      // this.logFormErrors();
      return;
    }
    this.spinner.show();
    this.submitted = true;
    let formvalue = this.signupForm.value;
    formvalue["role"] = "user";
    formvalue['preflang'] = 'en';
    this._auth.register(formvalue).subscribe(
        data => {
          if (data.status) {
            Swal.fire(Swaldata.SwalSuccessToast("Registration successfully and activation mail send  to your email"));
            this._router.navigate(["/login"]);
          } else {
            Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
          }
        },
        error => {

          Swal.fire(Swaldata.SwalErrorToast(error));
        }
      ).add(() => {
        this.spinner.hide();
      });
  }
}
