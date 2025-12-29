import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { adminService } from "./../../../../shared/services/admin.service";
import { NgxSpinnerService } from "ngx-spinner";
import { Router, ActivatedRoute } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from "../../../../../environments/environment";
import { HttpClient } from '@angular/common/http';
import { DataTablesResponse } from './../../../../shared/class/data-table-response';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import * as Swaldata from './../../../../shared/helpers/swalFunctionsData';
import * as moment from 'moment';
import jsPDF from "jspdf";
import 'jspdf-autotable';
import { HttpOptionsService } from '../../../../shared/services/http-options.service';
import { MyDataTablesSettings, DatatablesNetConfig, DatatablesNetConfigColumns, DatatablesNetApi } from '../../../../../typings';

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html',
})
export class ViewComponent implements OnInit, AfterViewInit {

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;
  dtOptions: MyDataTablesSettings = {};
  dtTrigger: any = new Subject<any>();

  profile_url = environment.fileurl + '/';
  driver_id: Number = -1;

  maxDate: moment.Moment;
  selected: { startDate: moment.Moment; endDate: moment.Moment; };
  startDate: string;
  endDate: string;
  total_earn_payment: number = 0;
  total_pending_pay: Number = 0;
  total_Paid: Number = 0;
  av_rating: Number = 0;

  //get user id and send it with each request
  private loggedInUser_Id = localStorage.getItem("currentUserId");

  userList = [];

  head = [['#', 'Order id', 'Restauarnt Name', 'Created Date', 'Earn Payment', 'Tip', 'Rating', 'Driver Paid']]

  data = []

  constructor(private http: HttpClient, private route: ActivatedRoute, private _router: Router, private adminsService: adminService, private spinner: NgxSpinnerService, private httpOptionsService: HttpOptionsService) { }

  ngOnInit() {
    this.driver_id = parseInt(this.route.snapshot.paramMap.get("id"));
    this.getUserslist();

  }

  getUserslist() {
    this.spinner.show();
    var that = this;
    this.dtOptions = {

      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        if (this.selected != null && this.selected.startDate && this.selected.endDate) {
          dataTablesParameters['startDate'] = this.startDate;
          dataTablesParameters['endDate'] = this.endDate
        }
        that.http
          // tslint:disable-next-line:max-line-length
          .post<DataTablesResponse>(`${environment.apiUrl}` + "/admin/getDriverOrders?loggedInUser_Id=" + this.loggedInUser_Id + "&driver_id=" + this.driver_id, dataTablesParameters, this.httpOptionsService.makeHttpRequestOptionsWithAuthentication())
          .subscribe(resp => {
            console.log("getUserslist: ", resp)
            this.av_rating = resp.av_rating
            this.data = []
            resp.data.forEach((element, i) => {
              let tip = element.tip
              if (tip) {
                tip = "$" + tip
              }
              this.data[i] = [i+1, element.order_id, element.res_name, element.created_date, "$"+element.earn_payment, tip, element.rating, element.driver_paid]
            });
            that.userList = resp.data;
            console.log(that.userList)
            this.total_earn_payment = resp.total_earn_payment
            this.total_pending_pay = resp.total_pending_pay
            this.total_Paid = resp.total_Paid
            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: [],
            });

          },
            error => {
              this._router.navigate(['admin/dashboard']);
              Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
            }).add(() => {
              this.spinner.hide();
            });
      },
      columns: [
        { data: "id", searchable: false, orderable: false },
        { data: "order_id", searchable: false, },
        { data: "res_name", searchable: false, orderable: false },
        { data: "created_date", searchable: false, },
        { data: "earn_payment", searchable: false, orderable: false },
        { data: "tip", searchable: false, orderable: false },
        { data: "rating", searchable: false, orderable: false },
        { data: "driver_paid", searchable: false, orderable: false },
        { data: "action", searchable: false, orderable: false }

      ],
      order: [[0, "desc"]]
    };

  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  rerender(): void {
    if (this.selected != null) {
      this.startDate = moment(this.selected.startDate).format('YYYY-MM-DD');
      this.endDate = moment(this.selected.endDate).format('YYYY-MM-DD');
    }

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

  resetFilters() {
    this.selected = null
    //this.selected = { startDate: null, endDate: null };
    this.rerender()
  }

  paydriver(id) {
    Swal.fire(Swaldata.SwalConfirm('Status will be change to Paid')).then(result => {
      if (result.value) {
        this.spinner.show()
        this.adminsService.paydriver(id).subscribe(
          data => {
            if (data.status) {
              Swal.fire(Swaldata.SwalSuccessToast('Successfully Updated'))
            } else {
              Swal.fire(Swaldata.SwalErrorToast('Something went wrong'))
            }
          },
          err => {
            Swal.fire(Swaldata.SwalErrorToast(err))
          }
        ).add(() => {
          this.spinner.hide()
        })
      }
    })
  }

  report() {
    var doc = new jsPDF();

    doc.setFontSize(18);
    doc.text('Drivers Table', 11, 8);
    doc.setFontSize(11);
    doc.setTextColor(100);


    (doc as any).autoTable({
      head: this.head,
      body: this.data,
      theme: 'plain',
      didDrawCell: data => {
        console.log(data.column.index)
      }
    })

    // Open PDF document in new tab
    doc.output('dataurlnewwindow')

    // Download PDF document
    doc.save('driver.pdf');
  }
}
