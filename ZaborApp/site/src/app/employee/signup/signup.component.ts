import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { routerTransition } from "../../router.animations";
import { tosterOptions } from "../../../environments/environment";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MustMatch } from "../../shared/helpers/custom.validator";
import { UserService } from "../../shared/services/user.service";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';
import * as Swaldata from '../../shared/helpers/swalFunctionsData';

@Component({
    selector: "app-signup",
    templateUrl: "./signup.component.html",
    styleUrls: ["./signup.component.scss"],
    animations: [routerTransition()]
})
export class SignupComponent implements OnInit {
    signupForm: FormGroup;
    submitted = false;

    constructor(
        private _router: Router,
        private formBuilder: FormBuilder,
        private userService: UserService,
        private spinner: NgxSpinnerService
    ) { }

    ngOnInit() {
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

    onSubmit() {
        if (this.signupForm.invalid) {
            return;
        }
        this.spinner.show();
        this.submitted = true;
        let formvalue = this.signupForm.value;
        formvalue["role"] = "employee";
        this.userService.register(formvalue).subscribe(
            data => {
                if (data.status == 200) {

                    Swal.fire(Swaldata.SwalSuccessToast("Registration successfully and activation mail send  to your email"));
                    this._router.navigate(["/employee/login"]);
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
