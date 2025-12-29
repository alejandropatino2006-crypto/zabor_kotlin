import {AfterViewInit, Component, HostListener, OnInit, ViewChild} from '@angular/core';
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
import {isNullOrEmpty} from '../../../shared/helpers/commonFunctions';
import { TranslatePipe } from '@ngx-translate/core';
import { DatatableLanguage } from 'src/app/shared/helpers/dataTableLanguages';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../../shared/services/translation.service';
import { HttpOptionsService } from '../../../shared/services/http-options.service';
import { MyDataTablesSettings, DatatablesNetConfig, DatatablesNetConfigColumns, DatatablesNetApi } from '../../../../typings';

const defaultGridOptions = {
  "destroy": true,
  "ordering": true,
  "paging": true,
  "searching": false,
  // "select": false,
  "lengthMenu": [ [10, 15, 25, 35, 50, -1], [10, 15, 25, 35, 50, "All"] ],
  // "lengthMenu": [ [50, 100, 250, -1], [50, 100, 250, "All"] ],
  language: { // https://datatables.net/reference/option/language
    "emptyTable": "No data available",
    // "info": "Showing [_START_ .. _END_] of _TOTAL_ entries",
    "loadingRecords": "Loading data now! wait...",
    // "lengthMenu": "Displayed number of entries _MENU_",
    // "searchPlaceholder": "Search records",
    // "search": "Search:",
    // "paginate": {
    //   "first": "&lt;&lt;",
    //   "next": '<i class="fa fa-fw fa-long-arrow-right">',
    //   "previous": '<i class="fa fa-fw fa-long-arrow-left">',
    //   "last": "&gt;&gt;"
    // }
  },
};

function escapeHtml (text: string) {
  const escapeHtmlEntityMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };

  return String(text).replace(/[&<>"'`=\/]/g, function (s) {
    // @ts-ignore
    return escapeHtmlEntityMap[s];
  });
}

function simpleLink( data, type, full, meta ) {
  if (type === 'display') {
    let clickLink = '<a class="link-label-in-table"';
    // clickLink += ' data-row="' + escapeHtml(JSON.stringify(full)) + '"';
    clickLink += ` href="/owner/restaurants/edit/${full.res_id}"`;
    clickLink += `>${full.res_name}</a>`;
    return clickLink;
  }
  return data;
}

function simpleButtonDetail( data, type, full, meta ) {
  if (type === 'display') {
    let editLink = '<a class="btn badge btn-primary btn-sm link-generated-at-runtime"';
    editLink += ' data-row="' + escapeHtml(JSON.stringify(full)) + '"';
    editLink += ` href="/owner/reservation/detail/${data}"`;
    editLink += '><i class="fa fa-pencil"></i>Edit</a>';
    return editLink;
  }
  return data;
}

// const gridColumnList: DataTables.ColumnSettings[] = [
const gridColumnList: DatatablesNetConfigColumns[] = [
  {"data": "id", "width": '30'},
  {"data": "revid", "width": '70'},
  {"data": "username"},
  {"data": "res_name", "width": '260', "render": simpleLink},
  {"data": "created_at", "width": '100'},
  {"data": "revid", "width": '140', "render": simpleButtonDetail},
];

@Component({
  selector: 'app-reservations',
  templateUrl: './reservations.component.html',
  styles: ['.dataTables_empty { display: none; }', '.no-data-available{ text-align: center}', 'span.status-td{padding: 10px;background: rgb(229, 229, 229);border-radius: 4px;color: rgb(119, 119, 119);font-size:14px}', 'span.success{background: #c6e1c6;color: #5b841b;}', 'span.warning{background: #f8dda7;color: #94660c;}', 'span.primary{background: #c8d7e1;color: #2e4453;}', 'span.danger{background: #eba3a3;color: #761919;}']
})
// export class ReservationsComponent implements OnInit, AfterViewInit {
export class ReservationsComponent implements OnInit {

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  // dtOptions: DataTables.Settings = {};
  dtOptions: MyDataTablesSettings = {};
  dtTrigger: any = new Subject<any>();
  reservationList: Array<any> = [];
  userid: Number = parseInt(localStorage.getItem("currentUserId"), 10);
  currentLang: any;

  constructor(private http: HttpClient, private routingRouter: Router, private restaurantService: RestaurantService, private spinner: NgxSpinnerService, public translation: TranslationService,
    private translate: TranslateService, private httpOptionsService: HttpOptionsService) { }

  // convert href to router-link
  @HostListener('document:click', ['$event'])
  public handleClick(event: Event): void {
    const eventTarget = event.target;
    if (eventTarget instanceof HTMLAnchorElement) {
      const element = event.target as HTMLAnchorElement;
      if (element.classList.contains('link-generated-at-runtime')) {
        event.preventDefault();
        event.stopPropagation();
        const href = element.getAttribute('href');
        if (href != null) {
          this.routingRouter.navigate([href]);
        }
      }
    }
  }

  ngOnInit() {
    this.currentLang = this.translate.currentLang; // Get initial language

    this.translate.onLangChange.subscribe((newLang:any) => {
      this.currentLang = newLang.lang;
      // Perform actions on language change (e.g., update UI, reload data)
      console.log('Language changed to:', newLang);
      console.log('Language changed to:', newLang.lang);
      this.updateDtOptions();
    });

    this.getReservation();
  }

  updateDtOptions() {
    console.log("current lang in update options",this.currentLang)
    this.dtOptions.language = this.currentLang === "es" ? DatatableLanguage.datatableSpanish : DatatableLanguage.datatableEnglish;
    console.log("this.dtOptions",this.dtOptions.language)
  }

  getReservation() {
    this.spinner.show();
    var that = this;
    this.dtOptions = {
      ...defaultGridOptions,
      language : (this.currentLang == "es")? DatatableLanguage.datatableSpanish: DatatableLanguage.datatableEnglish,
      columns: gridColumnList,
      columnDefs: [
        {targets: [1, 2, 3, 4], "searchable": true, "orderable": true},
        {targets: '_all', "searchable": false, "orderable": false}
      ],
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        that.http
          // tslint:disable-next-line:max-line-length
          .post<DataTablesResponse>(`${environment.apiUrl}` + "/user/getReservation?userid=" + this.userid, dataTablesParameters, this.httpOptionsService.makeHttpRequestOptionsWithAuthentication())
          .subscribe(resp => {
console.log('data', resp);
              if (resp.status) {
                const listData = [];
                if (resp.data != null && Array.isArray(resp.data) && resp.data.length > 0) {
                  that.reservationList = resp.data;
                  // const listData = [{id: 1, revid: 1, username: 'test', res_name: 'rrrr', res_id: 11, created_at: '2022-08-12'}];
                  if (!isNullOrEmpty(resp.data)) {
                    resp.data.forEach((element, i) => {
                      const displayElement = {...element, serial: i + 1};
                      listData.push({...displayElement});
                    });
                  }
                }
                callback({
                  recordsTotal: resp.recordsTotal,
                  recordsFiltered: resp.recordsFiltered,
                  data: listData,
                });
              } else {
                Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
              }
          },
            error => {
              this.routingRouter.navigate(['owner/dashboard']);
              Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
            }).add(() => {
              this.spinner.hide();
            });
      },
      // columns: [
      //   { data: "id", searchable: false, orderable: false },
      //   { data: "revid" },
      //   { data: "username" },
      //   { data: "res_name" },
      //   { data: "created_at" },
      //   { data: "action", searchable: false, orderable: false },
      // ],
      "order": [[1, "desc"]]
    };

    $('#reservation-data-table').DataTable(this.dtOptions);
  }

  // ngAfterViewInit(): void {
  //   this.dtTrigger.next();
  // }


  // rerender(): void {
  //   this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
  //     // Destroy the table first
  //     dtInstance.destroy();
  //     // Call the dtTrigger to rerender again
  //     this.dtTrigger.next();
  //     this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
  //       dtInstance.on('draw.dt', function () {
  //         if ($('.dataTables_empty').length > 0) {
  //           $('.dataTables_empty').remove();
  //         }
  //       });
  //     });
  //   });
  // }

}
