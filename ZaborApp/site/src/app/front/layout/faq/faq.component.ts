import { Component, OnInit } from '@angular/core';
import { TranslationService } from '../../../shared/services/translation.service';
import { UserService } from './../../../shared/services/frontServices/user.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as Swaldata from './../../../shared/helpers/swalFunctionsData';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styles: ['.card-title{color: #222222;}']
})
export class FaqComponent implements OnInit {

  public faqs: Array<any> = []
  constructor(public translation: TranslationService, public userService: UserService, public spinner: NgxSpinnerService) { }

  ngOnInit() {
    this.spinner.show();
    this.userService.getFaqs().subscribe(
      data => {
        if (data.status) {
          this.faqs = data.faqs

        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.msg))
        }
      },
      err => {
        Swal.fire(Swaldata.SwalErrorToast(err))
      }
    ).add(() => {
      this.spinner.hide()
    })
  }

}
