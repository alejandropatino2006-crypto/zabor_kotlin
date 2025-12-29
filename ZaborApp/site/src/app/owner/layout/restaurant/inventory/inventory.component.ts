import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { RestaurantService } from "../../../../shared/services/restaurant.service";
import { NgxSpinnerService } from "ngx-spinner";
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DataTablesResponse } from '../../../../shared/class/data-table-response';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../../shared/helpers/swalFunctionsData';
import { TranslatePipe } from '@ngx-translate/core';
import { DatatableLanguage } from 'src/app/shared/helpers/dataTableLanguages';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../../../shared/services/translation.service';
import { ClientStorageService } from 'src/app/shared/services/client-storage.service';
import { HttpOptionsService } from '../../../../shared/services/http-options.service';
import { MyDataTablesSettings, DatatablesNetConfig, DatatablesNetConfigColumns, DatatablesNetApi } from '../../../../../typings';

@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.component.html',
  styleUrls: ['./inventory.component.scss']
})
export class InventoryComponent implements OnInit, AfterViewInit {

  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  // dtOptions: DataTables.Settings = {};
  dtOptions: MyDataTablesSettings = {};
  dtTrigger: any = new Subject<any>();
  picUrl = environment.fileurl + '/';
  inventoryList: Array<any> = [];
  userid = parseInt(localStorage.getItem("currentUserId"), 10);
  // private loggedInUser_Id = localStorage.getItem("currentUserId");
  currentLang: any;
  restaurantId: number;

  constructor(
    private http: HttpClient,
    private routingRouter: Router,
    private restaurantService: RestaurantService,
    private spinner: NgxSpinnerService,
    public translation: TranslationService,
    private translate: TranslateService,
    private changeDetector: ChangeDetectorRef,
    private route: ActivatedRoute,
    private httpOptionsService: HttpOptionsService
  ) { }

  ngOnInit() {
    this.restaurantId = parseInt(this.route.snapshot.paramMap.get("restid"), 10);
    this.currentLang = this.translate.currentLang; // Get initial language

    this.translate.onLangChange.subscribe((newLang: any) => {
      this.currentLang = newLang.lang;
      // Perform actions on language change (e.g., update UI, reload data)
      console.log('Language changed to:', newLang);
      console.log('Language changed to:', newLang.lang);
      this.updateDtOptions();
    });

    this.getInverntory();
  }

  updateDtOptions() {
    console.log("current lang in update options", this.currentLang);
    this.dtOptions.language = this.currentLang === "es" ? DatatableLanguage.datatableSpanish : DatatableLanguage.datatableEnglish;
    console.log("this.dtOptions", this.dtOptions.language);
    this.changeDetector.detectChanges();
  }

  // handleBackClicked(evt: MouseEvent) {
  //   evt.preventDefault();
  //   const loggedInArea = this.clientStorage.retrieveCurrentLoggedInArea();
  //   if (loggedInArea === 'admin') {
  //     this.routingRouter.navigate(['admin', 'restaurant', 'list']);
  //   }
  //   if (loggedInArea === 'owner') {
  //     this.routingRouter.navigate(['owner', 'restaurants', 'list']);
  //   }
  // }

  getInverntory() {
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
          .get<DataTablesResponse>(`${environment.apiUrl}/user/getinventorylist?userid=${this.userid}&restid=${this.restaurantId}`, this.httpOptionsService.makeHttpRequestOptionsWithAuthentication())
          .subscribe({
            next: (resp: any) => {
              console.log("inventory list: ", resp);
              that.inventoryList = resp.data;
              console.log("inventory list: ", this.inventoryList);

              callback({
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                data: [],
              });
            },
            error: (error) => {
              Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Inventory List has some error.")));
              this.spinner.hide();
            },
            complete: () => {
              this.spinner.hide();
            }
          });
      },
      columns: [
        // { data: "#", searchable: false, orderable: false },
        { data: "id", searchable: false, orderable: false },
        { data: "name", searchable: false, orderable: false },
        { data: "pack_size_quantity_on_hand" },
        { data: "total_pack_size_value" },
        { data: "action", searchable: false, orderable: false }
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

  // changeStatus(event, id) {
  //   const status = (event === true) ? 1 : 0;
  //   const data = { status, id };
  //   this.spinner.show();
  //   this.restaurantService.changerestaurantStatus(data).subscribe(res => {
  //     if (res) {
  //       if (res.status === 200) {
  //         Swal.fire(Swaldata.SwalSuccessToast(res.msg));
  //       } else {
  //         Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
  //       }
  //
  //     } else {
  //       Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
  //     }
  //
  //   }).add(() => {
  //     this.spinner.hide();
  //   });
  // }

  deleteInventory(event, inventoryId) {
    event.preventDefault();
    Swal.fire(Swaldata.SwalConfirm(this.translate.instant("Are you sure you want to delete this inventory?"))).then((result) => {
      if (result.value) {
        console.log(result.value, inventoryId);
        if (result.value) {
          this.spinner.show();
          this.restaurantService.deleteInventory(inventoryId).subscribe(
            data => {
              if (data.status) {
                this.rerender();
                Swal.fire(Swaldata.SwalSuccessToast(this.translate.instant('Inventory delete succefully')));
              } else {
                Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Problem deleting Inventory!')));
              }
            },
            error => {
              Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Problem deleting Inventory!')));
            }
          ).add(() => {
            this.spinner.hide();
          });
        }
      }
    });
  }

}
