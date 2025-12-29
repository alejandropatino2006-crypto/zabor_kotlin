import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { RestaurantService } from "../../../shared/services/restaurant.service";
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DataTablesResponse } from './../../../shared/class/data-table-response';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import * as Swaldata from './../../../shared/helpers/swalFunctionsData';
import { HttpOptionsService } from '../../../shared/services/http-options.service';
import { MyDataTablesSettings, DatatablesNetConfig, DatatablesNetConfigColumns, DatatablesNetApi } from '../../../../typings';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styles: ['.dataTables_empty { display: none; }', '.no-data-available{ text-align: center}']
})
export class AdminRestaurantsComponent implements OnInit, AfterViewInit {
  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  dtOptions: MyDataTablesSettings = {};
  dtTrigger: any = new Subject<any>();
  picUrl = environment.fileurl + '/';
  restaurantList = [];
  userid = parseInt(localStorage.getItem("currentUserId"), 10);

  // get user id and send it with each request
  private loggedInUserId = localStorage.getItem("currentUserId");

  constructor(private http: HttpClient, private routingRouter: Router, private restaurantService: RestaurantService, private spinner: NgxSpinnerService, private httpOptionsService: HttpOptionsService) { }


  ngOnInit() {
    this.getRestaurants();
  }

  getRestaurants() {
    this.spinner.show();
    const that = this;
    this.dtOptions = {

      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        that.http
          // tslint:disable-next-line:max-line-length
          .post<DataTablesResponse>(`${environment.apiUrl}` + "/admin/getrestaurantlist?loggedInUser_Id= " + this.loggedInUserId + "&userid=" + this.userid, dataTablesParameters, this.httpOptionsService.makeHttpRequestOptionsWithAuthentication())
          .subscribe(resp => {

            that.restaurantList = resp.data;

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
        { data: "restaurantPic", searchable: false, orderable: false },
        { data: "restaurantname" },
        { data: "username" },
        { data: "created_at" },
        { data: "status", searchable: false, orderable: false },
        { data: "action", searchable: false, orderable: false },
        { data: "gallery", searchable: false, orderable: false }

      ],
      order: [[4, "desc"]]
    };

  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  changeStatus(event, id) {
    const status = (event === true) ? 1 : 0;
    const data = { status, id };
    this.spinner.show();
    this.restaurantService.changerestaurantStatusForAdmin(data).subscribe(res => {
      if (res) {
        if (res.status === 200) {
          Swal.fire(Swaldata.SwalSuccessToast(res.msg));
        } else {
          Swal.fire(Swaldata.SwalErrorToast(res.msg));
        }
      } else {
        Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
      }

    }, err => {
      Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
    }).add(() => {
      this.spinner.hide();
    });
  }

}
