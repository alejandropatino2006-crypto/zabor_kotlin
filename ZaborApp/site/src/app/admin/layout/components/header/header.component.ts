import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { adminService } from 'src/app/shared/services/admin.service';
import { environment } from "../../../../../environments/environment";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { noOnlyWhitespaceValidator } from 'src/app/shared/helpers/custom.validator';
import { MustMatch } from "../../../../shared/helpers/custom.validator";
import { NgxSpinnerService } from "ngx-spinner";
import Swal from 'sweetalert2';
import * as Swaldata from './../../../../shared/helpers/swalFunctionsData';
declare var $: JQueryStatic;

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    public pushRightClass: string;
    public currentuser;
    public fileurl = environment.fileurl;
    changepasswordform: FormGroup;

    public extraclass: boolean = false;

    constructor(private translate: TranslateService, public adminservice: adminService, private spinner: NgxSpinnerService, private _fb: FormBuilder, private _auth: AuthenticationService, public router: Router
    ) {

        this.router.events.subscribe(val => {
            if (
                val instanceof NavigationEnd &&
                window.innerWidth <= 992 &&
                this.isToggled()
            ) {
                this.toggleSidebar();
            }
        });
    }

    ngOnInit() {
        if (window.innerWidth <= 992) {
            this.extraclass = true;
        }
        this.adminservice.Setuserdata();
        this.currentuser = JSON.parse(localStorage.getItem('currentuser'));
        this.pushRightClass = 'push-right';
        this.changepasswordform = this._fb.group({
            oldpassword: ['', [Validators.required, noOnlyWhitespaceValidator]],
            newpassword: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.minLength(6)]],
            confirmpassword: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.minLength(6)]]
        },
            {
                validator: MustMatch("newpassword", "confirmpassword")
            }
        )
    }

    isToggled(): boolean {
        const dom: Element = document.querySelector('body');
        return dom.classList.contains(this.pushRightClass);
    }

    toggleSidebar() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle(this.pushRightClass);
    }

    rltAndLtr() {
        const dom: any = document.querySelector('body');
        dom.classList.toggle('rtl');
    }

    onLoggedout() {
        this._auth.logout();
    }

    changeLang(language: string) {
        this.translate.use(language);
    }

    changepassword() {
        (<any>$('#myModal')).modal('show');
    }

    submitPassword() {
        if (this.changepasswordform.invalid) {
            return;
        }

        this.spinner.show();
        const data = this.changepasswordform.value;
        delete data['confirmpassword'];
        this._auth.changeAdminPassword(data).subscribe(
            response => {
                if (response.status) {
                    Swal.fire(Swaldata.SwalSuccessToast(response.msg));
                    this.changepasswordform.reset();
                    (<any>$('#myModal')).modal('hide');
                }
                else
                    Swal.fire(Swaldata.SwalErrorToast(response.msg));
            },
            error => {
                Swal.fire(Swaldata.SwalErrorToast('Something went wrong'))
            }
        ).add(() => {
            this.spinner.hide();
        });
    }
}
