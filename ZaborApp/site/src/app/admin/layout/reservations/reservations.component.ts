import { AfterViewInit, Component, OnInit, ViewChild } from '@angular/core';
import { RestaurantService } from "../../../shared/services/restaurant.service";
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DataTablesResponse } from '../../../shared/class/data-table-response';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../shared/helpers/swalFunctionsData';
import { HttpOptionsService } from '../../../shared/services/http-options.service';
import { MyDataTablesSettings, DatatablesNetConfig, DatatablesNetConfigColumns, DatatablesNetApi } from '../../../../typings';

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styles: ['.dataTables_empty { display: none; }', '.no-data-available{ text-align: center}', 'span.status-td{padding: 10px;background: rgb(229, 229, 229);border-radius: 4px;color: rgb(119, 119, 119);font-size:14px}', 'span.success{background: #c6e1c6;color: #5b841b;}', 'span.warning{background: #f8dda7;color: #94660c;}', 'span.primary{background: #c8d7e1;color: #2e4453;}', 'span.danger{background: #eba3a3;color: #761919;}']
})
export class ReservationsComponent implements OnInit, AfterViewInit {

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  dtOptions: MyDataTablesSettings = {};
  dtTrigger: any = new Subject<any>();
  reservationList: Array<any> = [];
  userid = parseInt(localStorage.getItem("currentUserId"), 10);

  constructor(private http: HttpClient, private routingRouter: Router, private restaurantService: RestaurantService, private spinner: NgxSpinnerService, private httpOptionsService: HttpOptionsService) { }


  ngOnInit() {
    this.getReservation();
  }

  getReservation() {
    // this.spinner.show();
    let that = this;
    this.dtOptions = {
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        that.http
          // tslint:disable-next-line:max-line-length
          .post<DataTablesResponse>(`${environment.apiUrl}` + "/admin/getReservation?loggedInUser_Id=" + this.userid + "&userid=" + this.userid, dataTablesParameters, this.httpOptionsService.makeHttpRequestOptionsWithAuthentication())
          .subscribe(resp => {
            that.reservationList = resp.data;

            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: [],
            });
          },
            error => {
              this.routingRouter.navigate(['admin/dashboard']);
              Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
            }).add(() => {
              this.spinner.hide();
            });
      },
      columns: [
        { data: "id", searchable: false, orderable: false },
        { data: "revid" },
        { data: "username" },
        { data: "res_name" },
        { data: "created_at" },
        { data: "action", searchable: false, orderable: false },
      ],
      order: [[1, "desc"]]
    };
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
        dtInstance.on('draw.dt', function() {
          if ($('.dataTables_empty').length > 0) {
            $('.dataTables_empty').remove();
          }
        });
      });
    });
  }
}
