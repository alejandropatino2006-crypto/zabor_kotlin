import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { RestaurantService } from "../../../../shared/services/restaurant.service";
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { interval, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DataTablesResponse } from '../../../../shared/class/data-table-response';
import Swal from 'sweetalert2';
import * as Swaldata from './../../../../shared/helpers/swalFunctionsData';
import { HttpOptionsService } from '../../../../shared/services/http-options.service';
import { DatatablesNetConfigColumns } from '../../../../../typings';
import { DatatablesNetTableComponent } from '../../../../shared/modules/datatable-net/datatables-net-table/datatables-net-table.component';

declare var $: JQueryStatic;

const advertsGridColumnList: DatatablesNetConfigColumns[] = [
  { data: "id", searchable: false, orderable: false },
  { data: "pic", searchable: false, orderable: false },
  { data: "restaurantname" },
  { data: "username" },
  { data: "start_date" },
  { data: "end_date" },
  { data: "status", searchable: false, orderable: false },
  { data: "created_at", searchable: false, },
  { data: 'action', searchable: false, orderable: false },
];

const advertsGridHeadings = [
  "#",
  "Advert Pic",
  "Restaurant Name",
  "Restaurant User",
  "Start Date",
  "End Date",
  "Status",
  "Created Date",
  "Actions",
];

@Component({
  selector: 'app-advert',
  templateUrl: './advert.component.html',
  styles: ['.dataTables_empty { display: none; }', '.no-data-available{ text-align: center}', '#advert-image{width:100%}', 'td img{cursor: pointer;}', '.modal-content{border:none}']
})
export class AdvertComponent implements OnInit, AfterViewInit {
  @ViewChild(DatatablesNetTableComponent, { static: false }) datatablesNetTable!: DatatablesNetTableComponent;
  private source = interval(2000);
  private sourceSubscription: Subscription;
  rowsCount = 0;
  headingColumnsCount = advertsGridHeadings.length;

  pic_url = environment.fileurl + '/';
  advertList = [];
  userid: Number = parseInt(localStorage.getItem("currentUserId"));

  //get user id and send it with each request
  private loggedInUser_Id = localStorage.getItem("currentUserId");

  constructor(private http: HttpClient, private _router: Router, private restaurantService: RestaurantService, private spinner: NgxSpinnerService, private httpOptionsService: HttpOptionsService) { }

  ngOnInit() {
    this.getAdverts();
  }

  initializeDatatable() {
    this.sourceSubscription = this.source.subscribe((event: any) => {
      if (this.datatablesNetTable != null) {
        const that = this;
        this.datatablesNetTable.setHeadings(advertsGridHeadings);
        this.datatablesNetTable.setDtOptions({
          pageLength: 10,
          serverSide: true,
          processing: true,
          ajax: (dataTablesParameters: any, callback) => {
            that.http
              // tslint:disable-next-line:max-line-length
              .post<DataTablesResponse>(`${environment.apiUrl}` + "/admin/get-adverts?loggedInUser_Id= " + this.loggedInUser_Id + "&userid=" + this.userid, dataTablesParameters, this.httpOptionsService.makeHttpRequestOptionsWithAuthentication())
              .subscribe(resp => {
                  const dtCallbackData = {
                    recordsTotal: 0,
                    recordsFiltered: 0,
                    data: [],
                  };
                  if (resp.status) {
                    that.advertList = resp.data;
                    that.rowsCount = resp.data.length;
                    dtCallbackData.recordsTotal = resp.recordsTotal;
                    dtCallbackData.recordsFiltered = resp.recordsFiltered;
                  }
                  callback(dtCallbackData);
                },
                error => {
                  this._router.navigate(['admin/dashboard']);
                  Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
                }).add(() => {
              this.spinner.hide();
            });
          },

          columns: advertsGridColumnList,
          order: [[7, "desc"]]
        });
        this.sourceSubscription.unsubscribe();
        this.sourceSubscription = null;

        setTimeout(() => {
          this.datatablesNetTable.load();
        }, 500);
      }
    });
  }

  getAdverts() {
    this.spinner.show();
    this.initializeDatatable();
  }

  ngAfterViewInit(): void {
  }

  changeStatus(event, id) {
    event.preventDefault();
    let status = (event == true) ? 1 : 0;
    let data = { status, id };
    this.spinner.show();
    this.restaurantService.changeadvertStatusForAdmin(data).subscribe(res => {
      if (res) {
        if (res.status) {
          Swal.fire(Swaldata.SwalSuccessToast(res.msg));
        } else {
          Swal.fire(Swaldata.SwalErrorToast(res.msg));
        }
      }
      else {
        Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
      }

    }).add(() => {
      this.datatablesNetTable.rerender();
      this.spinner.hide();
    });
  }

  openModel(imgsrc) {
    $("#advert-image").attr('src', imgsrc);
    (<any>$('#advertModal')).modal('show');
  }

  deleteAdvert(event, id) {
    event.preventDefault();
    this.spinner.show();
    this.restaurantService.deleteAdvert(id).subscribe(
      res => {
        if (res.status) {
          Swal.fire(Swaldata.SwalSuccessToast(res.msg));
        } else {
          Swal.fire(Swaldata.SwalErrorToast(res.msg));
        }
      },
      error => {
        Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
      }
    ).add(() => {
      this.datatablesNetTable.rerender();
      this.spinner.hide();
    });
  }

}
