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
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
    selector: "app-signup",
    templateUrl: "./signup.component.html",
    styleUrls: ["./signup.component.scss"],
    animations: [routerTransition()]
})
export class SignupComponent implements OnInit {
    signupForm: FormGroup;
    submitted = false;
    passwordFieldType = 'password';
    repeatpasswordFieldType = 'password';

    constructor(
        private _router: Router,
        private formBuilder: FormBuilder,
        private userService: UserService,
        private spinner: NgxSpinnerService,
        private translateService: TranslateService
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

    handlePasswordToggle(evt: MouseEvent) {
        evt.preventDefault();
        const currentlyHidden = this.passwordFieldType === 'password';
        this.passwordFieldType = currentlyHidden ? 'text' : 'password';
    }

    handleRepeatPasswordToggle(evt: MouseEvent) {
        evt.preventDefault();
        const currentlyHidden = this.repeatpasswordFieldType === 'password';
        this.repeatpasswordFieldType = currentlyHidden ? 'text' : 'password';
    }

    onSubmit() {
        if (this.signupForm.invalid) {
            return;
        }
        this.spinner.show();
        this.submitted = true;
        const formValue = this.signupForm.value;
        formValue["role"] = "owner";
        formValue['preflang'] = this.translateService.currentLang;
        this.userService.register(formValue).subscribe(
            response => {
                if (response.status) {
                    this.userService.storeSignupEmail(formValue.email);
                    Swal.fire(Swaldata.SwalSuccessToast(this.translateService.instant('Registration successful and activation mail sent to your email')));
                    this._router.navigate(["/owner/login"]);
                } else {
                    Swal.fire(Swaldata.SwalErrorToast(this.translateService.instant("Something went wrong")));
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
