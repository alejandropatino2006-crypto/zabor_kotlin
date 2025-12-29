import { Component, OnInit, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import { adminService } from "./../../../shared/services/admin.service";
import Swal from 'sweetalert2';
import * as Swaldata from './../../../shared/helpers/swalFunctionsData';
import { Subject } from 'rxjs';
import { noOnlyWhitespaceValidator } from "./../../../shared/helpers/custom.validator";
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { DataTableDirective } from 'angular-datatables';
import { dataURLtoFile } from "./../../../shared/helpers/commonFunctions";
import { environment } from 'src/environments/environment';
import { MyDataTablesSettings, DatatablesNetConfig, DatatablesNetConfigColumns, DatatablesNetApi } from '../../../../typings';

@Component({
  selector: 'app-faq',
  templateUrl: './faq.component.html',
  styles: ['.dataTables_empty { display: none; }', '.no-data-available{ text-align: center}']
})
export class FaqComponent implements OnInit {
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: MyDataTablesSettings = {};

  dtTrigger: any = new Subject<any>();

  faqs: Array<any> = [];

  faqForm: FormGroup;

  title: string = "Add Faq";
  faq_id: number = -1
  editcategoryForm: boolean = false

  constructor(private _router: Router, private formBuilder: FormBuilder, private adminsService: adminService, private spinner: NgxSpinnerService) { }

  ngOnInit() {
    //get all saved faq
    this.spinner.show()
    this.adminsService.getfaqlist().subscribe(
      data => {

        if (data.status) {

          this.faqs = data.faqs

        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.faq))
        }
        this.dtTrigger.next();
      },
      err => {
      }
    ).add(() => {
      this.spinner.hide()
    })

    this.faqForm = this.formBuilder.group({
      title: ['', [Validators.required, noOnlyWhitespaceValidator]],
      description: ['', [Validators.required, noOnlyWhitespaceValidator]],
      title_es: ['', [Validators.required, noOnlyWhitespaceValidator]],
      description_es: ['', [Validators.required, noOnlyWhitespaceValidator]]
    })
  }

  onSubmit() {


    if (!this.faqForm.valid)
      return

    this.spinner.show()
    let temp = this.faqForm.value;
    temp['faq_id'] = this.faq_id;
    this.adminsService.addFaq(temp).subscribe(
      data => {
        if (data.status) {
          if (data.insertId && data.insertId > 0) {
            this.faqs.unshift({ faq_title: this.faqForm.get('title').value, id: data.insertId })
          }

          if (this.faq_id > 0) {
            this.faqs.forEach((ele, i) => {
              if (ele.id == this.faq_id)
                this.faqs[i].faq_title = this.faqForm.get('title').value
            })
          }
          Swal.fire(Swaldata.SwalSuccessToast(data.msg))

        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.msg))
        }
      },
      err => {
        Swal.fire(Swaldata.SwalErrorToast(err))
      }
    ).add(() => {
      this.spinner.hide()
      this.faqForm.reset()
      this.faq_id = -1;
      this.title = "Add Faq";
    })
  }

  editfaq(id) {
    if (id < 1) {
      Swal.fire(Swaldata.SwalErrorToast('Id is invalid'))
    }

    this.title = 'Edit Faq'
    this.spinner.show()
    this.adminsService.getfaq(id).subscribe(
      data => {
        if (data.status) {
          this.faqForm.patchValue({
            title: data.data.faq_title,
            description: data.data.faq_des,
            title_es: data.data.faq_title_es,
            description_es: data.data.faq_des_es
          })
          this.faq_id = data.data.id
        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.msg))
        }
      },
      err => {
        Swal.fire(Swaldata.SwalErrorToast(err))
      }
    ).add(() => {
      this.spinner.hide();

    })
  }

  addfaq() {
    this.title = "Add Faq";
    this.faqForm.reset();
    this.faq_id = -1
  }

  deleteFaq(id) {
    if (id < 1) {
      Swal.fire(Swaldata.SwalErrorToast('Id is invalid'))
    }
    this.spinner.show()
    this.adminsService.deletefaq(id).subscribe(
      data => {

        if (data.status) {
          Swal.fire(Swaldata.SwalSuccessToast(data.msg))
          this.faqs = this.faqs.filter(ele => ele.id != id)
        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.msg))
        }
      },
      err => {
        Swal.fire(Swaldata.SwalSuccessToast(err))
      }
    ).add(() => {
      this.spinner.hide()
    })
  }

}
