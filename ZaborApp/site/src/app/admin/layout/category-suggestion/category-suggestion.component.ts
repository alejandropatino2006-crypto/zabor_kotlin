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
  selector: 'app-category-suggestion',
  templateUrl: './category-suggestion.component.html',
  styles: ['.dataTables_empty { display: none; }', '.no-data-available{ text-align: center}', '.feedback-block{ padding : 30px}',]
})
export class CategorySuggestionComponent implements OnInit, AfterViewInit {
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: MyDataTablesSettings = {};
  dtTrigger: any = new Subject<any>();
  //get user id and send it with each request
  private loggedInUser_Id = localStorage.getItem("currentUserId");

  usersuggestions = [];
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
          // tslint:disable-next-line:max-line-length
          .post<DataTablesResponse>(`${environment.apiUrl}` + "/admin/category-suggestion?loggedInUser_Id=" + this.loggedInUser_Id, dataTablesParameters, this.httpOptionsService.makeHttpRequestOptionsWithAuthentication())
          .subscribe(resp => {
            that.usersuggestions = resp.data;

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
        { data: "category" },
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


  deletesuggestion(suggestionid) {
    Swal.fire(Swaldata.SwalConfirm("Suggestion will delete")).then((result) => {
      if (result.value) {
        this.spinner.show();
        this.adminsService.deleteSuggestion(suggestionid).subscribe(
          res => {
            if (res.status) {
              Swal.fire(Swaldata.SwalSuccessToast(res.msg));
              this.rerender();
            }
            else {
              Swal.fire(Swaldata.SwalErrorToast(res.msg));
            }
          },
          error => {
            Swal.fire(Swaldata.SwalErrorToast(error));
          }
        ).add(() => {
          this.spinner.hide();
        });

      }
    })
  }


}
