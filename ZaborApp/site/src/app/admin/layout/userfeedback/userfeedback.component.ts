import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { adminService } from "./../../../shared/services/admin.service";
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from "../../../../environments/environment";
import { HttpClient } from '@angular/common/http';
import { DataTablesResponse } from './../../../shared/class/data-table-response';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import * as Swaldata from './../../../shared/helpers/swalFunctionsData';
import { HttpOptionsService } from '../../../shared/services/http-options.service';
import { MyDataTablesSettings, DatatablesNetConfig, DatatablesNetConfigColumns, DatatablesNetApi } from '../../../../typings';

declare var $: JQueryStatic;

@Component({
  selector: 'app-userfeedback',
  templateUrl: './userfeedback.component.html',
  styles: ['.dataTables_empty { display: none; }', '.no-data-available{ text-align: center}', '.feedback-block{ padding : 30px}',]
})
export class UserfeedbackComponent implements OnInit, AfterViewInit {
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: MyDataTablesSettings = {};
  dtTrigger: any = new Subject<any>();
  //get user id and send it with each request
  private loggedInUser_Id = localStorage.getItem("currentUserId");

  userfeedbacks = [];
  openFeedback: any = "";

  constructor(private http: HttpClient, private _router: Router, private adminsService: adminService, private spinner: NgxSpinnerService, private httpOptionsService: HttpOptionsService) { }

  ngOnInit() {
    this.getfeedbacklist();
  }

  getfeedbacklist() {
    this.spinner.show();
    var that = this;
    this.dtOptions = {

      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        that.http
          .post<DataTablesResponse>(`${environment.apiUrl}` + "/admin/userfeedback?loggedInUser_Id=" + this.loggedInUser_Id, dataTablesParameters, this.httpOptionsService.makeHttpRequestOptionsWithAuthentication())
          .subscribe(resp => {
            that.userfeedbacks = resp.data;
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: [],
            });
          },
            error => {
              this._router.navigate(['admin/dashboard']);
              Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
            });
      },
      columns: [
        { data: "id", searchable: false, orderable: false },
        { data: "username" },
        { data: "subject" },
        { data: "created_at" },
        { data: "action", searchable: false, orderable: false }
      ],
      order: [[3, 'desc']]
    };
    this.spinner.hide();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  changeStatus(event, id) {
    let status = (event == true) ? 1 : 0;
    let data = { status, id };
    this.spinner.show();
    this.adminsService.changeStatus(data).subscribe(res => {
      if (res) {
        if (res.status == 200) {
          Swal.fire(Swaldata.SwalSuccessToast(res.msg));
        } else {
          Swal.fire(Swaldata.SwalErrorToast(res.msg));
        }

      }
      else {
        Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
      }

    }).add(() => {
      this.spinner.hide();
    });
  }

  show_feedback(i) {
    this.openFeedback = this.userfeedbacks[i];
    (<any>$('#feedbackModal')).modal('show');
  }

  rerender(): void {
    // this.dtElement.dtInstance.then((dtInstanceCurr: DataTables.Api) => {
    this.dtElement.dtInstance.then((dtInstanceCurr: DatatablesNetApi<any>) => {
      // Destroy the table first
      dtInstanceCurr.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next();
      // this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtElement.dtInstance.then((dtInstance: DatatablesNetApi<any>) => {
        dtInstance.on('draw.dt', function () {
          if ($('.dataTables_empty').length > 0) {
            $('.dataTables_empty').remove();
          }
        });
      });
    });
  }

  delete_feedback(feedback_id) {
    event.preventDefault();
    Swal.fire(Swaldata.SwalConfirm("User feedback will delete")).then((result) => {
      if (result.value) {
        if (isNaN(feedback_id)) {
          Swal.fire(Swaldata.SwalErrorToast('feedback id is invalid'));
          return;
        }
        this.spinner.show();
        this.adminsService.deletefeedback(feedback_id).subscribe(
          data => {
            if (data.status) {
              this.rerender();
              Swal.fire(Swaldata.SwalSuccessToast('User Feedback deleted succefully'));
            }
            else {
              Swal.fire(Swaldata.SwalErrorToast('Something went wrong!'));
            }
          },
          error => {
            Swal.fire(Swaldata.SwalErrorToast(error));
          }
        ).add(() => {
          this.spinner.hide();
        })

      }
    })
  }
}
