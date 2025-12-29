import {AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild} from '@angular/core';
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
import { TranslatePipe } from '@ngx-translate/core';
import { DatatableLanguage } from 'src/app/shared/helpers/dataTableLanguages';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../../shared/services/translation.service';
import { ClientStorageService } from '../../../shared/services/client-storage.service';
import { HttpOptionsService } from '../../../shared/services/http-options.service';
import { MyDataTablesSettings, DatatablesNetConfig, DatatablesNetConfigColumns, DatatablesNetApi } from '../../../../typings';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html',
  styles: ['.dataTables_empty { display: none; }', '.no-data-available{ text-align: center}']
})
export class OwnerRestaurantsComponent implements OnInit, AfterViewInit {

  @ViewChild(DataTableDirective)
  dtElement: DataTableDirective;

  // dtOptions: DataTables.Settings = {};
  dtOptions: MyDataTablesSettings = {};
  dtTrigger: any = new Subject<any>();
  picUrl = environment.fileurl + '/';
  restaurantList = [];
  userid: number;
  currentLang: any;


  constructor(private http: HttpClient, private routingRouter: Router, private restaurantService: RestaurantService, private spinner: NgxSpinnerService, public translation: TranslationService,
              private translate: TranslateService, private changeDetector: ChangeDetectorRef, private clientStorage: ClientStorageService, private httpOptionsService: HttpOptionsService) {
    // this.titleService.setTitle("Restaurants");
    this.userid = this.clientStorage.retrieveCurrentUserId();
  }

  ngOnInit() {
    this.currentLang = this.translate.currentLang; // Get initial language

    this.translate.onLangChange.subscribe((newLang: any) => {
      this.currentLang = newLang.lang;
      // Perform actions on language change (e.g., update UI, reload data)
      console.log('Language changed to:', newLang);
      console.log('Language changed to:', newLang.lang);
      this.updateDtOptions();
    });

    this.getRestaurants();
  }

  updateDtOptions() {
    console.log("current lang in update options", this.currentLang);
    this.dtOptions.language = this.currentLang === "es" ? DatatableLanguage.datatableSpanish : DatatableLanguage.datatableEnglish;
    console.log("this.dtOptions", this.dtOptions.language);
    this.changeDetector.detectChanges();
  }

  getRestaurants() {
    this.spinner.show();
    const that = this;
    this.dtOptions = {
      language : (this.currentLang === "es") ? DatatableLanguage.datatableSpanish : DatatableLanguage.datatableEnglish,
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        console.log('dataTablesParameters', dataTablesParameters);
        that.http
          // .post<DataTablesResponse>(`${environment.apiUrl}` + "/user/getrestaurantlist?loggedInUser_Id=" + this.loggedInUser_Id + "&userid=" + this.userid, dataTablesParameters, {})
          // tslint:disable-next-line:max-line-length
          .post<DataTablesResponse>(`${environment.apiUrl}` + "/user/getrestaurantlist?loggedInUser_Id=" + this.userid + "&userid=" + this.userid, dataTablesParameters, this.httpOptionsService.makeHttpRequestOptionsWithAuthentication())
          .subscribe(resp => {
            console.log("resList: ", resp);
            that.restaurantList = resp.data;

            callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: [],
            });
          },
            error => {
              this.routingRouter.navigate(['owner/dashboard']);
              Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
            }).add(() => {
              this.spinner.hide();
            });
      },
      columns: [
        { data: "#", searchable: false, orderable: false },
        { data: "restaurantPic", searchable: false, orderable: false },
        { data: "restaurantname" },
        { data: "id", searchable: false, orderable: false },
        { data: "created_at" },
        { data: "status", searchable: false, orderable: false },
        { data: "action", searchable: false, orderable: false },
        { data: "menu", searchable: false, orderable: false },
        { data: "gallery", searchable: false, orderable: false }

      ],
      order: [[3, "desc"]]
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
      this.dtElement.dtInstance.then((dtInstance: DatatablesNetApi<any>) => {
        dtInstance.on('draw.dt', function() {
          if ($('.dataTables_empty').length > 0) {
            $('.dataTables_empty').remove();
          }
        });
      });
    });
  }

  changeStatus(event, id) {
    const status = (event === true) ? 1 : 0;
    const data = { status, id };
    this.spinner.show();
    this.restaurantService.changerestaurantStatus(data).subscribe(res => {
      if (res) {
        if (res.status === 200) {
          Swal.fire(Swaldata.SwalSuccessToast(res.msg));
        } else {
          Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
        }

      } else {
        Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
      }

    }).add(() => {
      this.spinner.hide();
    });
  }

  DeleteRestaurant(event, res_id) {
    event.preventDefault();
    Swal.fire(Swaldata.SwalConfirm(this.translate.instant("All Restaurant data will delete"))).then((result) => {
      if (result.value) {
        if (isNaN(res_id)) {
          Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Restaurant is invalid')));
          return;
        }
        this.spinner.show();
        this.restaurantService.deleteRestaurant(res_id).subscribe(
          data => {
            if (data.status) {
              this.rerender();
              Swal.fire(Swaldata.SwalSuccessToast(this.translate.instant('Restaurant delete succefully')));
            } else {
              Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Something went wrong!')));
            }
          },
          error => {
            Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Something went wrong!')));
          }
        ).add(() => {
          this.spinner.hide();
        });

      }
    });
  }

}
