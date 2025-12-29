import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { AuthenticationService } from '../../../../shared/services/authentication.service';
import { adminService } from './../../../../shared/services/admin.service';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { NgxSpinnerService } from 'ngx-spinner';
import { noOnlyWhitespaceValidator } from 'src/app/shared/helpers/custom.validator';
import { SwalConfirm, SwalSuccessToast, SwalErrorToast } from 'src/app/shared/helpers/swalFunctionsData';
import Swal from 'sweetalert2';


@Component({
    selector: 'app-sidebar',
    templateUrl: './sidebar.component.html',
    styleUrls: ['./sidebar.component.scss']
})
export class SidebarComponent implements OnInit {
    isActive: boolean;
    collapsed: boolean;
    showMenu: string;
    pushRightClass: string;
    staticPages: Array<any> = [];
    sendmessageform: FormGroup;

    @Output() collapsedEvent = new EventEmitter<boolean>();

    constructor(private spinner: NgxSpinnerService, private _fb: FormBuilder, private translate: TranslateService, public router: Router, private _auth: AuthenticationService, private user: adminService) {
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
        this.isActive = false;
        this.collapsed = false;
        this.showMenu = '';
        this.pushRightClass = 'push-right';
        if (this.user.staticPages.length < 1) {
            this.user.getStaicPagesName().subscribe(
                data => {
                    this.staticPages = this.user.staticPages;
                })
        } else {
            this.staticPages = this.user.staticPages;

        }

        this.sendmessageform = this._fb.group({
            msg: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(200)]],
            role: ['', [Validators.required]]

        })

    }


    eventCalled() {
        this.isActive = !this.isActive;
    }

    addExpandClass(element: any) {
        if (element === this.showMenu) {
            this.showMenu = '0';
        } else {
            this.showMenu = element;
        }
    }

    toggleCollapsed() {
        this.collapsed = !this.collapsed;
        this.collapsedEvent.emit(this.collapsed);
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

    changeLang(language: string) {
        this.translate.use(language);
    }

    onLoggedout() {
        this._auth.logout();
    }

    messagemodel() {
        this.sendmessageform.reset();
        (<any>$('#messageModal')).modal('show');
    }


    submitmsg() {
        if (this.sendmessageform.invalid)
            return;

        Swal.fire(SwalConfirm('')).then(result => {
            if (result.value) {
                this.spinner.show();
                this.user.sendmsg(this.sendmessageform.value).subscribe(
                    data => {
                        if (data.status)
                            Swal.fire(SwalSuccessToast(data.msg))
                        else
                            Swal.fire(SwalErrorToast(data.msg))
                    },
                    error => {
                        Swal.fire(SwalErrorToast(error))
                    }
                ).add(() => {
                    this.spinner.hide();
                    this.sendmessageform.reset();
                    (<any>$('#messageModal')).modal('hide');
                })
            }
        })

    }

}
