import { Component, OnInit } from "@angular/core";
import { Router, ActivatedRoute, Params } from "@angular/router";
import { tosterOptions } from "../../../environments/environment";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { MustMatch } from "../../shared/helpers/custom.validator";
import { UserService } from "./../../shared/services/user.service";
import { NgxSpinnerService } from "ngx-spinner";
import { ToastrService } from 'ngx-toastr';
import Swal from 'sweetalert2';
import * as Swaldata from './../../shared/helpers/swalFunctionsData';


@Component({
  selector: 'app-resetpassword',
  templateUrl: './resetpassword.component.html',
  styleUrls: ['./resetpassword.component.scss']
})
export class ResetpasswordComponent implements OnInit {
  resetform: FormGroup;
  token: string;
  email: string;

  constructor(private _router: Router,
    private formBuilder: FormBuilder,
    private userService: UserService,
    private spinner: NgxSpinnerService,
    private toastr: ToastrService,
    private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    this.token = this.activatedRoute.snapshot.queryParams["token"];
    this.email = this.activatedRoute.snapshot.queryParams["email"];

    $('body').addClass('nonepadding');
    this.resetform = this.formBuilder.group(
      {
        password: ["", [Validators.required, Validators.minLength(6)]],
        confirmPassword: ["", Validators.required]
      },
      {
        validator: MustMatch("password", "confirmPassword")
      }
    );
  }

  onSubmit() {
    if (this.resetform.invalid) {
      return;
    }

    this.spinner.show();
    //create form data
    let formvalue = { password: this.resetform.value['password'], token: this.token, email: this.email };
    this.userService.resetpasswordforFront(formvalue).subscribe(
      data => {
        if (data.status != false) {
          Swal.fire(Swaldata.SwalSuccessToast("password change successfully"));
          this._router.navigate(['/']);
        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.msg));
        }
      },
      error => {
        Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
      }
    ).add(() => {
      this.spinner.hide();
    });
  }

}
