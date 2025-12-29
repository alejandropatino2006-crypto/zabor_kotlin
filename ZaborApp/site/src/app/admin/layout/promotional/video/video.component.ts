import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { RestaurantService } from "../../../../shared/services/restaurant.service";
import { NgxSpinnerService } from "ngx-spinner";
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { interval, Subject, Subscription } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DataTablesResponse } from './../../../../shared/class/data-table-response';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import * as Swaldata from './../../../../shared/helpers/swalFunctionsData';
import { HttpOptionsService } from '../../../../shared/services/http-options.service';
import { MyDataTablesSettings, DatatablesNetConfig, DatatablesNetConfigColumns, DatatablesNetApi } from '../../../../../typings';
import { DatatablesNetTableComponent } from '../../../../shared/modules/datatable-net/datatables-net-table/datatables-net-table.component';
import * as moment from 'moment';
import { isNullOrEmpty } from '../../../../shared/helpers/commonFunctions';

declare var $: JQueryStatic;

// const videosGridColumnList: DataTables.ColumnSettings[] = [
const videosGridColumnList: DatatablesNetConfigColumns[] = [
  { data: "id", searchable: false, orderable: false },
  { data: "videothumb", searchable: false, orderable: false },
  { data: "restaurantname" },
  { data: "username" },
  { data: "start_date" },
  { data: "end_date" },
  { data: "status", searchable: false, orderable: false },
  { data: "created_at", searchable: false, },
  { data: 'action', searchable: false, orderable: false },
];

const videosGridHeadings = [
  "#",
  "Video",
  "Restaurant Name",
  "Restaurant User",
  "Start Date",
  "End Date",
  "Status",
  "Created Date",
  "Actions",
];


@Component({
  selector: 'app-video',
  templateUrl: './video.component.html',
  styles: ['.dataTables_empty { display: none; }', '.no-data-available{ text-align: center}', 'td img{cursor: pointer;}']
})
export class VideoComponent implements OnInit, AfterViewInit {
  @ViewChild(DatatablesNetTableComponent, { static: false }) datatablesNetTable!: DatatablesNetTableComponent;
  private source = interval(2000);
  private sourceSubscription: Subscription;
  rowsCount = 0;
  headingColumnsCount = videosGridHeadings.length;

  pic_url = environment.fileurl + '/';
  videoList = [];
  userid: Number = parseInt(localStorage.getItem("currentUserId"));

  //get user id and send it with each request
  private loggedInUser_Id = localStorage.getItem("currentUserId");

  constructor(private http: HttpClient, private _router: Router, private restaurantService: RestaurantService, private spinner: NgxSpinnerService, private httpOptionsService: HttpOptionsService) { }

  ngOnInit() {
    this.getAdverts();

    // stop playing the youtube video when I close the modal
    $('#videoModal').on('hidden.bs.modal', function () {
      // do something…
      $("#video").attr('src', '');

    });

  }

  initializeDatatable() {
    this.sourceSubscription = this.source.subscribe((event: any) => {
      if (this.datatablesNetTable != null) {
        const that = this;
        this.datatablesNetTable.setHeadings(videosGridHeadings);
        this.datatablesNetTable.setDtOptions({
          columns: videosGridColumnList,
          order: [[7, "desc"]],
          pageLength: 10,
          serverSide: true,
          processing: true,
          ajax: (dataTablesParameters: any, callback) => {
            that.http
              // tslint:disable-next-line:max-line-length
              .post<DataTablesResponse>(`${environment.apiUrl}` + "/admin/get-advertvideo?loggedInUser_Id= " + this.loggedInUser_Id + "&userid=" + this.userid, dataTablesParameters, this.httpOptionsService.makeHttpRequestOptionsWithAuthentication())
              .subscribe(resp => {
                  that.videoList = resp.data;
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
    let status = (event == true) ? 1 : 0;
    let data = { status, id };
    this.spinner.show();
    this.restaurantService.changeadvertvideoStatusForAdmin(data).subscribe(res => {
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

  openModel(video) {
    $("#video").attr('src', this.pic_url + '/' + video + "?autoplay=1&amp;modestbranding=1&amp;showinfo=0");
    (<any>$('#videoModal')).modal('show');
  }

  deleteVideo(event, id) {
    event.preventDefault();
    this.spinner.show();
    this.restaurantService.deletePromoVideo(id).subscribe(
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
