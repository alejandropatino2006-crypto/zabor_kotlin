import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../shared/services/authentication.service';
import { ToastrService } from 'ngx-toastr';
import { tosterOptions } from 'src/environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as Swaldata from '../../shared/helpers/swalFunctionsData';

@Component({
  selector: 'app-forget-password',
  templateUrl: './forget-password.component.html',
  styleUrls: ['./forget-password.component.scss']
})
export class ForgetPasswordComponent implements OnInit {
  forgetPassword: FormGroup;
  submitted = false;
  public errorMessage: string;

  constructor(private _router: Router,
    private _auth: AuthenticationService,
    private formBuilder: FormBuilder,
    private toaster: ToastrService,
    private spinner: NgxSpinnerService,
  ) { }

  ngOnInit() {
    this.spinner.hide();
    // Check if user already logged In 
    this.errorMessage = '';
    this.forgetPassword = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
    })
  }

  onSubmit() {

    // stop here if form is invalid
    if (this.forgetPassword.invalid) {
      return;
    }
    this.submitted = true;
    this.spinner.show()
    this._auth.forgetPassword(this.forgetPassword.value)
      .subscribe(
        res => {
          if (res.status) {
            Swal.fire(Swaldata.SwalSuccessToast(res.msg));

          } else {
            Swal.fire(Swaldata.SwalErrorToast(res.msg));
          }
        },
        error => {
          Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
        }
      ).add(() => {
        this.spinner.hide()
      })
  }

}
