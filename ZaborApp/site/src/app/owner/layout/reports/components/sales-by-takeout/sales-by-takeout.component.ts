import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { RestaurantService } from '../../../../../shared/services/restaurant.service';
import {DataTableDirective} from 'angular-datatables';
import {Subject} from 'rxjs';
import {DataTablesResponse} from '../../../../../shared/class/data-table-response';
import {environment} from '../../../../../../environments/environment';
import {isNullOrEmpty} from '../../../../../shared/helpers/commonFunctions';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../../../shared/helpers/swalFunctionsData';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Router} from '@angular/router';
import {NgxSpinnerService} from 'ngx-spinner';
import * as moment from 'moment/moment';
import {ClientStorageService} from '../../../../../shared/services/client-storage.service';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../../../../shared/services/translation.service';
import { DatatableLanguage } from 'src/app/shared/helpers/dataTableLanguages';
import { HttpOptionsService } from '../../../../../shared/services/http-options.service';
import { MyDataTablesSettings, DatatablesNetConfig, DatatablesNetConfigColumns, DatatablesNetApi } from '../../../../../../typings';

function simpleCurrencyLabel(data, type) {
  if (type === "display") {
    if (typeof data !== "string") {
      data = String(data);
    }
    let clickLink = `<p`;
    if (data === "null") {
      clickLink += ' class="currency-label-in-table" style="width:100%;"';
      // clickLink += `><span class="zero-val">$0.00</span></p>`;
      clickLink += `><span class="zero-val">$0.00</span></p>`;
    } else {
      clickLink += ' class="currency-label-in-table" style="width:100%;"';
      const totalValue = data.split(".");
      const [dollars, cents] = data.split('.');
      // console.log('totalValue', totalValue);
      console.log("cents", cents, "---- dollars", dollars);
      // const formattedDollars = dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	  const formattedDollars = new Intl.NumberFormat('en-US').format(parseInt(dollars));
      let formattedCents = '';
      if (cents) {
        formattedCents = cents ? "." + cents.slice(0, 2).padEnd(2, '0') : '.00';
      } else {
        formattedCents = '.00';
      }

      clickLink += `>$${formattedDollars}${formattedCents}</p>`;
    }
    return clickLink;
  } else if (type === "notcur") {
    if (typeof data !== "string") {
      data = String(data);
    }

    if (data === "null") {
      return '0';
    }

    const [dollars, cents] = data.split('.');
    // const formattedDollars = dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	const formattedDollars = new Intl.NumberFormat('en-US').format(parseInt(dollars));

    return `${formattedDollars}${cents ? `.${cents.slice(0, 2).padEnd(2, '0')}` : '.00'}`;
  } else {
    if (typeof data !== "string") {
      data = String(data);
    }

    if (data === "null") {
      return '$0.00';
    }

    const [dollars, cents] = data.split('.');
    // const formattedDollars = dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
	const formattedDollars = new Intl.NumberFormat('en-US').format(parseInt(dollars));

    let formattedCents = '';
    if (cents) {
      formattedCents = cents ? "." + cents.slice(0, 2).padEnd(2, '0') : '.00';
    } else {
      formattedCents = '.00';
    }

    // console.log("cents",cents);
    // console.log("cents.slice(0, 2).padEnd(2, '0')",cents.slice(0, 2).padEnd(2, '0'))

    return `$${formattedDollars}${formattedCents}`;
  }
}

// const gridColumnList: DataTables.ColumnSettings[] = [
const gridColumnList: DatatablesNetConfigColumns[] = [
  {data: "serial"},
  {data: "id"},
  {data: "invoice_number"},
  {data: "order_by"},
  {data: "order_code"},
  {data: "total", render: simpleCurrencyLabel},
  {data: "food_tax",  render: simpleCurrencyLabel},
  {data: "drink_tax",  render: simpleCurrencyLabel},
  {data: "tax",  render: simpleCurrencyLabel},
  {data: "convenience_fee",  render: simpleCurrencyLabel},
];


@Component({
  selector: 'app-sales-by-takeout',
  templateUrl: './sales-by-takeout.component.html',
  styleUrls: ['./sales-by-takeout.component.scss']
})
export class SalesByTakeoutComponent implements OnInit {

  restaurantList: any = [];
  employeeList: any = [];
  shiftList: any = [];
  @Input() resId: Number = -1;
  @Input() delivery_mode: Number = 2;
  @Input() shiftId: Number = -1;
  tableTitle = 'Report (Take Out)';
  currentEmployee: any;
  currentShift: any;
  currentRestaurant: any;
  restaurantName = "N/A";
  currentLang: any;
  private lastWeek = false;
  private last30days = false;

  @ViewChild(DataTableDirective, { static: false }) datatableElement: DataTableDirective;
  dtOptions: MyDataTablesSettings = {};
  dtTrigger: any = new Subject<any>();
  // dtInstanceCallback: Promise<DataTables.Api>;
  dtInstanceCallback: Promise<DatatablesNetApi<any>>;
  // dtInstance: DataTables.Api;
  dtInstance: DatatablesNetApi<any>;

  total_sales_amount: any;
  total_food_tax: any;
  total_liquor_tax: any;
  total_generic_tax: any;
  total_convenience_fee: any;
  quantity_items_sold: any;

  selectedDate: { startDate: moment.Moment; endDate: moment.Moment };
  maxDate: moment.Moment;

  constructor(
    private restaurantService: RestaurantService,
    private spinner: NgxSpinnerService,
    private httpClient: HttpClient,
    private router: Router,
    private clientStorage: ClientStorageService,
    public translation: TranslationService,
    private translate: TranslateService,
    private httpOptionsService: HttpOptionsService
  ) {
    this.maxDate = moment();
  }

  rerender(): void {
    this.dtInstance.destroy();
    this.dtTrigger.next();
    if (!this.lastWeek && !this.last30days) {
      this.tableTitle = `Report (Take Out)`;
    }
  }

  resetFilters() {
    this.resId = -1;
    this.delivery_mode = -1;
    this.lastWeek = false;
    this.last30days = false;
    this.tableTitle = `Report (Take Out)`;
    this.rerender();
  }

  convertDateToDDMMYYYYHHMMSS(dateString) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();

    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    return `${day}-${month}-${year} ${hours}:${minutes}:${seconds}`;

  }

  inputChanged(evt: Object) {
    if (this.selectedDate && this.selectedDate.startDate !== undefined && this.selectedDate.startDate !== null && this.resId !== -1) {
      const mysqlStartDate = this.selectedDate.startDate.format("YYYY-MM-DD");

      this.shiftList = [];

      this.restaurantService.getAllShiftsByRestAndDate(
        this.resId,
        mysqlStartDate
      )
      .subscribe(
        (response): any => {
          if (response && response.status == true) {
            console.log("shift list: ", response);
            this.shiftList = response.data;
          } else {
            this.shiftList = [];
          }
        },
        (error) => {
          Swal.fire(Swaldata.SwalErrorToast("Shift List didnt come"));
        }
      )
      .add(() => {
        // this.spinner.hide();
        // this.getOrders();
      });

      this.lastWeek = false;
      this.last30days = false;
    }
  }

  handleCriteria(option: string) {
    this.lastWeek = option === 'last-week';
    this.last30days = option === 'last-30-days';
    this.dtInstance.destroy();
    this.dtTrigger.next();
  }

  onRestaurantChange() {
    console.log("restid", this.resId);
    this.currentRestaurant = this.restaurantList.find((rest) => rest.id == this.resId);
    this.restaurantName = this.currentRestaurant.name;
    this.employeeList = [];
    this.restaurantService.getAllEmployeesByRest(this.resId)
    .subscribe(
      (response): any => {
        if (response && (response.status == true)) {
          console.log("shift list: ", response);
          this.employeeList = response.data;
        } else {
          this.employeeList = [];
        }
      },
      (error) => {
        Swal.fire(Swaldata.SwalErrorToast("Shift List didnt come"));
      }
    )
    .add(() => {
      // this.spinner.hide();
      // this.getOrders();
    });
    this.shiftList = [];

    if (this.selectedDate && this.selectedDate.startDate !== undefined && this.selectedDate.startDate !== null && this.resId !== -1) {
      const mysqlStartDate = this.selectedDate.startDate.format("YYYY-MM-DD");

      this.restaurantService.getAllShiftsByRestAndDate(
        this.resId,
        mysqlStartDate
      )
      .subscribe(
        (response): any => {
          if (response && response.status == true) {
            console.log("shift list: ", response);
            this.shiftList = response.data;
          } else {
            this.shiftList = [];
          }
        },
        (error) => {
          Swal.fire(Swaldata.SwalErrorToast("Shift List didnt come"));
        }
      )
      .add(() => {
        // this.spinner.hide();
        // this.getOrders();
      });
      this.lastWeek = false;
      this.last30days = false;
    } else {
      this.restaurantService.getAllShifts(this.resId)
      .subscribe(
        (response): any => {
          if (response && response.status == true) {
            console.log("shift list: ", response);
            this.shiftList = response.data;
          } else {
            this.shiftList = [];
          }
        },
        (error) => {
          Swal.fire(Swaldata.SwalErrorToast("Shift List didnt come"));
        }
      )
      .add(() => {
        // this.spinner.hide();
        // this.getOrders();
      });
    }
  }

  onShiftChange() {
    this.currentShift = this.shiftList.find(
      (shift) => shift.id == this.shiftId
    );
    console.log("currentShift", this.currentShift);
    this.tableTitle = `Report for Shift = Start : ${this.convertDateToDDMMYYYYHHMMSS(this.currentShift.open_date_time)} - End : ${this.convertDateToDDMMYYYYHHMMSS(this.currentShift.close_date_time)}`;
  }

  updateDtOptions() {
    console.log("current lang in update options", this.currentLang);
    this.dtOptions.language = this.currentLang === "es" ? DatatableLanguage.datatableSpanish : DatatableLanguage.datatableEnglish;
    console.log("this.dtOptions", this.dtOptions.language);
  }

  ngOnInit() {

    this.spinner.show();
    this.currentLang = this.translate.currentLang;

    this.translate.onLangChange.subscribe((newLang: any) => {
      this.currentLang = newLang.lang;
      // Perform actions on language change (e.g., update UI, reload data)
      console.log('Language changed to:', newLang);
      console.log('Language changed to:', newLang.lang);
      this.updateDtOptions();
    });

    const that = this;
    this.dtOptions = {
      ...this.httpOptionsService.makeDefaultGridOptions(),
      language : (this.currentLang == "es") ? DatatableLanguage.datatableSpanish : DatatableLanguage.datatableEnglish,
      columns: gridColumnList,
      columnDefs: [
        {targets: [1, 2, 3, 4, 5, 6], searchable: true, orderable: true},
        {targets: '_all', searchable: false, orderable: false}
      ],
      pageLength: 50,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {

        dataTablesParameters["shiftId"] = this.shiftId;
        dataTablesParameters['delivery_mode'] = this.delivery_mode;
        dataTablesParameters['restaurantId'] = this.resId;

        if (this.lastWeek) {
          dataTablesParameters['lastWeek'] = 'true';
          this.tableTitle = `Report for last week`;
        }
        if (this.last30days) {
          dataTablesParameters['last30days'] = 'true';
          this.tableTitle = `Report for last 30 days`;
        }

        console.log("dataTablesParameters", dataTablesParameters);

        that.httpClient
          .post<DataTablesResponse>(`${environment.apiUrl}/user/getSalesReportByDeliveryMode`, dataTablesParameters, this.httpOptionsService.makeHttpRequestOptionsWithAuthentication())
          .subscribe(resp => {
              // console.log('resp++++++++: ', resp);
              const listData = [];
              if (!isNullOrEmpty(resp.data)) {
                resp.data.forEach((element, i) => {
                  const displayElement = {...element, serial: i + 1};
                  listData.push({...displayElement});
                });
              }

              this.total_sales_amount = simpleCurrencyLabel(resp.totalSales.total_sales_amount, "other");
              this.total_food_tax = simpleCurrencyLabel(resp.totalSales.total_food_tax, "other");
              this.total_liquor_tax = simpleCurrencyLabel(resp.totalSales.total_liquor_tax, "other");
              this.total_generic_tax = simpleCurrencyLabel(resp.totalSales.total_generic_tax, "other");
              this.total_convenience_fee = simpleCurrencyLabel(resp.totalSales.total_convenience_fee, "other");
              this.quantity_items_sold = simpleCurrencyLabel(resp.totalSales.quantity_items_sold, "notcur");

              callback({
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                data: listData,
              });
            },
            error => {
              Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
            }).add(() => {
          this.spinner.hide();
        });
      },
      order: [[2, "desc"], [1, "asc"]],
      dom: '<flip<t>ip>',
      scrollCollapse: true,
      buttons: [
          'copy', 'csv', 'excel', 'pdf', 'print'
      ]
    };
    that.dtInstance = $('#sales-data-table').DataTable(this.dtOptions);




    // this.restaurantService.getAllShifts(-1)
    // .subscribe(
    //   (response) => {
    //     // response.data.map(data => {
    //     //   this.restaurantList.push(data);
    //     // });
    //     console.log("shift list: ", response);
    //     this.shiftList = response.data;
    //     //this.resId = this.restaurantList[0].id;
    //   },
    //   (error) => {
    //     Swal.fire(Swaldata.SwalErrorToast("Shift List didnt come"));
    //   }
    // )
    // .add(() => {
    //   // this.spinner.hide();
    //   // this.getOrders();
    // });


    this.restaurantService.getrestaurantslist()
    .subscribe(
      (response) => {
        // response.data.map(data => {
        //   this.restaurantList.push(data);
        // });
        console.log("resList: ", response);
        this.restaurantList = response.data;
        // this.resId = this.restaurantList[0].id;
      },
      (error) => {
        Swal.fire(Swaldata.SwalErrorToast("Restaurant List didnt come"));
      }
    )
    .add(() => {
      // this.spinner.hide();
      // this.getOrders();
    });
  }

}
