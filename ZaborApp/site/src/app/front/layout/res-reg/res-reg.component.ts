import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { noOnlyWhitespaceValidator, MustMatch } from 'src/app/shared/helpers/custom.validator';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../shared/helpers/swalFunctionsData';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from './../../../shared/services/frontServices/user.service';
import * as moment from "moment";

@Component({
  selector: 'app-res-reg',
  templateUrl: './res-reg.component.html',
  styles: ['.form-control{padding:8px; border-radius:0; border: 1px solid #E5E5E5; }', 'label{color: #666666; font-weight: 400; font-size: 15px;}']
})
export class ResRegComponent implements OnInit {

  public driverForm: FormGroup;
  public resImg: any = {};

  constructor(private spinner: NgxSpinnerService, private fb: FormBuilder, private userService: UserService) { }


  ngOnInit() {
    this.driverForm = this.fb.group({
      firstname: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(20)]],
      lastname: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.maxLength(15), Validators.pattern('[0-9\+\-\]+'), Validators.minLength(10)]],
      resname: ['', [Validators.required, noOnlyWhitespaceValidator]]
    })
  }

  fileChangeEvent(event, type) {

    if (event.target.files && event.target.files.length) {

      if (event.target.files.length > 5)
        Swal.fire(Swaldata.SwalErrorToast('You can not select more than 5 images'))
      else
        this.resImg = event.target.files
    }


  }

  submit() {
    if (!this.driverForm.valid)
      return

    const files: Array<File> = this.resImg;
    if (!this.resImg.length || this.resImg.length < 1) {
      Swal.fire(Swaldata.SwalErrorToast('Please choose minimum 1 Restaurant Image'))
    }

    var formData = new FormData();
    Object.entries(this.driverForm.value).forEach(([key, value]: any[]) => {
      formData.set(key, value);
    });


    for (let i = 0; i < files.length; i++) {
      formData.append("resimg", files[i], files[i]['name']);
    }

    //  formData.set('resimg', this.resImg);

    this.spinner.show()
    this.userService.ResReg(formData).subscribe(
      data => {
        if (data.status) {
          Swal.fire(Swaldata.SwalSuccessToast('Your restaurant registered successfully. Admin will contact you!'))
        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.msg))
        }
      },
      err => {
        Swal.fire(Swaldata.SwalErrorToast(err))
      }
    ).add(() => {
      this.spinner.hide()
      this.driverForm.reset()
    })
  }

}
