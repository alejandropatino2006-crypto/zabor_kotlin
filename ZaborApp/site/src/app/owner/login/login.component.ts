import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as Swaldata from '../../shared/helpers/swalFunctionsData';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { UserService } from '../../shared/services/user.service';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

    loginForm: FormGroup;
    submitted = false;
    public errorMessage: string;
    passwordFieldType = 'password';

    constructor(private _router: Router,
        private _auth: AuthenticationService,
        private formBuilder: FormBuilder,
        private spinner: NgxSpinnerService,
        private translateService: TranslateService,
        private userService: UserService,
    ) { }

    ngOnInit() {
        this.spinner.hide();
        const signupEmail = this.userService.getSignupEmail();
        // Check if user already logged In
        this.errorMessage = '';
        this.loginForm = this.formBuilder.group({
            email: [signupEmail || '', [Validators.required, Validators.email]],
            password: ['', [Validators.required, Validators.minLength(6)]],
        });
    }


    onSubmit() {

        // stop here if form is invalid
        if (this.loginForm.invalid) {
            return;
        }
        this.submitted = true;
        this.spinner.show()
        this._auth.ownerLogin(this.loginForm.value)
            .subscribe(
                res => {
                    if (res.status) {
                        this.userService.clearSignupEmail();
                        Swal.fire(Swaldata.SwalSuccessToast(this.translateService.instant('Login Successfully')));
                        this._router.navigate(['/owner/dashboard']);
                    } else {
                        Swal.fire(Swaldata.SwalErrorToast(res.msg));
                    }
                },
                error => {
                    Swal.fire(Swaldata.SwalErrorToast(this.translateService.instant("Something went wrong")));
                }
            ).add(() => {
                this.spinner.hide()
            })
    }

    handlePasswordToggle(evt: MouseEvent) {
        evt.preventDefault();
        const currentlyHidden = this.passwordFieldType === 'password';
        this.passwordFieldType = currentlyHidden ? 'text' : 'password';
    }

}
