import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { noOnlyWhitespaceValidator, MustMatch } from 'src/app/shared/helpers/custom.validator';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../shared/helpers/swalFunctionsData';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from './../../../shared/services/frontServices/user.service';
import * as moment from "moment";

@Component({
  selector: 'app-driver-reg',
  templateUrl: './driver-reg.component.html',
  styles: ['.form-control{padding:8px; border-radius:0; border: 1px solid #E5E5E5; }', 'label{color: #666666; font-weight: 400; font-size: 15px;}']
})
export class DriverRegComponent implements OnInit {

  public driverForm: FormGroup;
  public License: any;
  public Certificate: any;

  constructor(private spinner: NgxSpinnerService, private fb: FormBuilder, private userService: UserService) { }

  ngOnInit() {
    this.driverForm = this.fb.group({
      firstname: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(20)]],
      lastname: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.maxLength(15), Validators.pattern('[0-9\+\-\]+'), Validators.minLength(10)]],
      job_avail: ['part', [Validators.required]],
      date_can_start: ['', [Validators.required]],
      vahical_type: ['bicycle', [Validators.required]]
    })
  }

  fileChangeEvent(event, type) {

    if (event.target.files && event.target.files.length) {

      if (type == "driverlic") {
        this.License = event.target.files[0]
      }
      if (type == "criminalRec") {
        this.Certificate = event.target.files[0]
      }
    }

  }
  submit() {
    if (!this.driverForm.valid)
      return

    var formData = new FormData();
    Object.entries(this.driverForm.value).forEach(([key, value]: any[]) => {
      formData.set(key, value);
    });

    formData.set('license', this.License);
    formData.set('criminalRec', this.Certificate);

    if (moment(this.driverForm.value.date_can_start.startDate).isValid)
      formData.set(
        "date_can_start",
        moment(this.driverForm.value.date_can_start.startDate).format("YYYY-MM-DD")
      );

    this.spinner.show()
    this.userService.driverReg(formData).subscribe(
      data => {
        if (data.status) {
          Swal.fire(Swaldata.SwalSuccessToast('Your Driver Registration Successfully'))
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
