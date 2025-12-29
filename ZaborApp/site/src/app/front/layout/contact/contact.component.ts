import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../shared/helpers/swalFunctionsData';
import { noOnlyWhitespaceValidator } from 'src/app/shared/helpers/custom.validator';
import { UserService } from './../../../shared/services/frontServices/user.service';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html'
})
export class ContactComponent implements OnInit {

  public contactForm: FormGroup;

  constructor(private _router: Router,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    public userService: UserService) { }

  ngOnInit() {
    this.contactForm = this.formBuilder.group({
      firstname: ['', [Validators.required, noOnlyWhitespaceValidator]],
      lastname: ['', [Validators.required, noOnlyWhitespaceValidator]],
      email: ['', [Validators.required, Validators.email]],
      message: ['', [Validators.required, Validators.minLength(6)]],
    })

  }


  onSubmit() {
    // stop here if form is invalid
    if (this.contactForm.invalid)
      return;

    this.spinner.show();
    this.userService.ContactUs(this.contactForm.value).subscribe(
      data => {
        if (data.status)
          Swal.fire(Swaldata.SwalSuccessToast(data.msg))
      },
      err => {
        Swal.fire(Swaldata.SwalErrorToast(err))
      },
    ).add(() => {
      this.spinner.hide();
      this.contactForm.reset()
    })

  }

}
