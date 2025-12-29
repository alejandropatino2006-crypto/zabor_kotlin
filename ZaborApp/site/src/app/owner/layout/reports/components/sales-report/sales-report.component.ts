import {Component, OnInit, ViewChild} from '@angular/core';
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

const defaultGridOptions = {
  destroy: true,
  ordering: true,
  paging: true,
  searching: true,
  lengthMenu: [ [50, 100, 250, -1], [50, 100, 250, "All"] ],
  language: { // https://datatables.net/reference/option/language
    emptyTable: "No data available",
    loadingRecords: "Loading data now! wait...",
  },
};

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
      const formattedDollars = dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
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
    const formattedDollars = dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

    return `${formattedDollars}${cents ? `.${cents.slice(0, 2).padEnd(2, '0')}` : '.00'}`;
  } else {
    if (typeof data !== "string") {
      data = String(data);
    }

    if (data === "null") {
      return '$0.00';
    }

    const [dollars, cents] = data.split('.');
    const formattedDollars = dollars.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

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
  {data: "serial", width: '30'},
  {data: "restaurant_name"},
  {data: "total_sales_amount", width: '110', render: simpleCurrencyLabel},
  {data: "total_food_tax", width: '110', render: simpleCurrencyLabel},
  {data: "total_liquor_tax", width: '110', render: simpleCurrencyLabel},
  {data: "total_generic_tax", width: '110', render: simpleCurrencyLabel},
  {data: "total_convenience_fee", width: '110', render: simpleCurrencyLabel},
];

@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.scss']
})
export class SalesReportComponent implements OnInit {
  @ViewChild(DataTableDirective) datatableElement: DataTableDirective;
  // dtOptions: DataTables.Settings = {};
  dtOptions: MyDataTablesSettings = {};
  dtTrigger: any = new Subject<any>();
  // dtInstanceCallback: Promise<DataTables.Api>;
  dtInstanceCallback: Promise<DatatablesNetApi<any>>;
  // dtInstance: DataTables.Api;
  dtInstance: DatatablesNetApi<any>;
  selectedDateRange: { startDate: moment.Moment; endDate: moment.Moment; };
  maxDate: any = moment();
  selectedYear: string | null = null;
  reportYears: {value_text: string; display_text: string}[];
  selectedMonth: string | null = null;
  reportMonths: {value_text: string; display_text: string}[];
  selectedDate: string | null = null;
  reportDates: {value_text: string; display_text: string}[];
  selectedRestaurantId: string | null = null;
  reportRestaurants: {id: number; name: string}[];
  private lastWeek = false;
  private last30days = false;
  tableTitle = 'Report (No criteria)';
  restaurantName = '';
  currentLang: any;

  constructor(private httpClient: HttpClient, private routingRouter: Router, private spinner: NgxSpinnerService, private clientStorage: ClientStorageService, public translation: TranslationService,
              private translate: TranslateService, private httpOptionsService: HttpOptionsService) {
    this.selectedRestaurantId = '0';
  }

  ngOnInit() {
    this.spinner.show();
    this.currentLang = this.translate.currentLang; // Get initial language

    this.translate.onLangChange.subscribe((newLang: any) => {
      this.currentLang = newLang.lang;
      // Perform actions on language change (e.g., update UI, reload data)
      console.log('Language changed to:', newLang);
      console.log('Language changed to:', newLang.lang);
      this.updateDtOptions();
    });

    this.httpClient.get<any>(`${environment.apiUrl}/api/salesReportRestaurants?ownerId=${this.clientStorage.retrieveCurrentUserId()}`, this.httpOptionsService.makeHttpRequestOptionsWithoutAuthentication())
      .subscribe((response: any) => {
        if (response.status) {
          this.reportRestaurants = response.data;
          this.selectedRestaurantId = String(response.data[0].id);
          this.restaurantName = response.data[0].name;

          const that = this;
          this.dtOptions = {
            ...defaultGridOptions,
            language : (this.currentLang === "es") ? DatatableLanguage.datatableSpanish : DatatableLanguage.datatableEnglish,
            columns: gridColumnList,
            columnDefs: [
              {targets: [1, 2, 3, 4, 5, 6], searchable: true, orderable: true},
              {targets: '_all', searchable: false, orderable: false}
            ],
            pageLength: 50,
            serverSide: true,
            processing: true,
            ajax: (dataTablesParameters: any, callback) => {

              if (this.selectedYear != null && this.selectedYear.length > 0) {
                dataTablesParameters['year'] = this.selectedYear;
                this.tableTitle = `Report for year ${this.selectedYear}`;
              }
              if (this.selectedMonth != null && this.selectedMonth.length > 0) {
                dataTablesParameters['month'] = this.selectedMonth;
                this.tableTitle = `Report for month ${moment(this.selectedMonth).format('MMM-YYYY')}`;
              }
              if (this.selectedDate != null && this.selectedDate.length > 0) {
                dataTablesParameters['oneDate'] = this.selectedDate;
                this.tableTitle = `Report for date = ${moment(this.selectedDate).format('DD-MMM-YYYY')}`;
              }
              if (this.selectedRestaurantId != null && this.selectedRestaurantId.length > 0) {
                const selectedId = parseInt(this.selectedRestaurantId, 10);
                if (selectedId > 0) {
                  dataTablesParameters['restaurantId'] = selectedId;
                  this.restaurantName = this.reportRestaurants.find(r => r.id === selectedId).name;
                }
              }

              if (this.selectedDateRange != null && this.selectedDateRange.startDate && this.selectedDateRange.endDate) {
                dataTablesParameters['startDate'] = moment(this.selectedDateRange.startDate).format('YYYY-MM-DD') + ' 00:00:00';
                dataTablesParameters['endDate'] = moment(this.selectedDateRange.endDate).format('YYYY-MM-DD') + ' 11:59:59';
                this.tableTitle = `Report for date-range = ${moment(this.selectedDateRange.startDate).format('DD-MMM-YYYY')} -- ${moment(this.selectedDateRange.endDate).format('DD-MMM-YYYY')}`;
              }

              if (this.lastWeek) {
                dataTablesParameters['lastWeek'] = 'true';
                this.tableTitle = `Report for last week`;
              }

              if (this.last30days) {
                dataTablesParameters['last30days'] = 'true';
                this.tableTitle = `Report for last 30 days`;
              }

              that.httpClient
                .post<DataTablesResponse>(`${environment.apiUrl}/api/salesReport`, dataTablesParameters, this.httpOptionsService.makeHttpRequestOptionsWithAuthentication())
                .subscribe(resp => {
                    // console.log('resp++++++++: ', resp);
                    const listData = [];
                    if (!isNullOrEmpty(resp.data)) {
                      resp.data.forEach((element, i) => {
                        const displayElement = {...element, serial: i + 1};
                        listData.push({...displayElement});
                      });
                    }
                    // this.TypesFilters = resp.TypesFilters;
                    // this.getOrdersTotal = resp.getOrdersTotal;
                    // this.filterTotal = resp.filterTotal;
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
            order: [[2, "desc"], [1, "asc"]]
          };

          that.dtInstance = $('#sales-data-table').DataTable(this.dtOptions);
          // dt.on('load', function (e, args) {
          //   that.dtInstanceCallback = new Promise<DataTables.Api>((resolve, reject) => {
          //     that.dtInstance =
          //     resolve();
          //   });
          // });
        } else {
          Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Restaurant not found")));
          this.routingRouter.navigate(['/owner/restaurants/list']);
        }
      }, error => {
        Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
      }
    ).add(() => {
      if (this.selectedRestaurantId == null) {
        Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Restaurant not found")));
        this.routingRouter.navigate(['/owner/restaurants/list']);
      } else {
        this.loadComboBoxes();
      }
    });
  }

  updateDtOptions() {
    console.log("current lang in update options", this.currentLang);
    this.dtOptions.language = this.currentLang === "es" ? DatatableLanguage.datatableSpanish : DatatableLanguage.datatableEnglish;
    console.log("this.dtOptions", this.dtOptions.language);
  }

  private loadComboBoxes() {
    this.httpClient
      .get<any>(`${environment.apiUrl}/api/salesReportCalendar?restaurantId=${this.selectedRestaurantId}`, this.httpOptionsService.makeHttpRequestOptionsWithoutAuthentication())
      .subscribe((resp: any) => {
        // console.log('years', resp.data);
        this.reportYears = resp.data;
      });

    this.httpClient
      .get<any>(`${environment.apiUrl}/api/salesReportCalendar?months=yes&restaurantId=${this.selectedRestaurantId}`, this.httpOptionsService.makeHttpRequestOptionsWithoutAuthentication())
      .subscribe((resp: any) => {
        // console.log('months', resp.data);
        this.reportMonths = resp.data;
      });

    this.httpClient
      .get<any>(`${environment.apiUrl}/api/salesReportCalendar?dates=yes&restaurantId=${this.selectedRestaurantId}`, this.httpOptionsService.makeHttpRequestOptionsWithoutAuthentication())
      .subscribe((resp: any) => {
        // console.log('dates', resp.data);
        this.reportDates = resp.data;
      });
  }

  rerender(): void {
    // console.log('datatableElement', this.datatableElement);
    // this.datatableElement.dtInstance.then((dtInstance1: DataTables.Api) => {
    //   // Destroy the table first
    //   dtInstance1.destroy();
    //   // Call the dtTrigger to rerender again
    //   this.dtTrigger.next();
    //   this.datatableElement.dtInstance.then((dtInstance: DataTables.Api) => {
    //     dtInstance.on('draw.dt', function () {
    //       if ($('.dataTables_empty').length > 0) {
    //         $('.dataTables_empty').remove();
    //       }
    //     });
    //   });
    // });

    // if (this.selectedRestaurantId === '0') {
    //   this.selectedRestaurantId = String(this.reportRestaurants[0].id);
    // }

    this.dtInstance.destroy();
    this.dtTrigger.next();
  }

  resetFilters() {
    this.selectedDateRange = null;
    this.selectedYear = null;
    this.selectedMonth = null;
    this.selectedDate = null;
    // this.selectedRestaurantId = null;
    this.lastWeek = false;
    this.last30days = false;
    this.rerender();
  }

  onSalesYearChange() {
    this.selectedDateRange = null;
    this.selectedMonth = null;
    this.selectedDate = null;
    // this.selectedRestaurantId = null;
    this.lastWeek = false;
    this.last30days = false;
  }

  onSalesMonthChange() {
    this.selectedDateRange = null;
    this.selectedYear = null;
    this.selectedDate = null;
    // this.selectedRestaurantId = null;
    this.lastWeek = false;
    this.last30days = false;
  }

  onSalesDateChange() {
    this.selectedDateRange = null;
    this.selectedYear = null;
    this.selectedMonth = null;
    // this.selectedRestaurantId = null;
    this.lastWeek = false;
    this.last30days = false;
  }

  inputChanged(evt: any) {
    this.selectedYear = null;
    this.selectedMonth = null;
    this.selectedDate = null;
    // this.selectedRestaurantId = null;
    this.lastWeek = false;
    this.last30days = false;
  }

  onSalesRestaurantChange() {
    this.selectedDateRange = null;
    this.selectedYear = null;
    this.selectedMonth = null;
    this.selectedDate = null;
    this.lastWeek = false;
    this.last30days = false;
    this.loadComboBoxes();
  }

  handleCriteria(option: string) {
    this.selectedDateRange = null;
    this.selectedYear = null;
    this.selectedMonth = null;
    this.selectedDate = null;
    // this.selectedRestaurantId = null;
    this.lastWeek = option === 'last-week';
    this.last30days = option === 'last-30-days';

    this.dtInstance.destroy();
    this.dtTrigger.next();
  }

}
