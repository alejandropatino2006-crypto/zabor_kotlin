import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { interval, Subscription } from 'rxjs';
import {DataTablesResponse} from '../../../../../shared/class/data-table-response';
import {environment} from '../../../../../../environments/environment';
import { isNullOrEmpty, simpleCurrencyLabel } from '../../../../../shared/helpers/commonFunctions';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../../../shared/helpers/swalFunctionsData';
import {HttpClient, HttpHeaders, HttpParams} from '@angular/common/http';
import {Router} from '@angular/router';
import {NgxSpinnerService} from 'ngx-spinner';
import * as moment from 'moment/moment';
import {ClientStorageService} from '../../../../../shared/services/client-storage.service';
import { HttpOptionsService } from '../../../../../shared/services/http-options.service';
import { DatatablesNetConfigColumns } from '../../../../../../typings';
import { DatatablesNetTableComponent } from '../../../../../shared/modules/datatable-net/datatables-net-table/datatables-net-table.component';

// const salesReportGridColumnList: DataTables.ColumnSettings[] = [
const salesReportGridColumnList: DatatablesNetConfigColumns[] = [
  {data: "serial", width: '30'},
  {data: "restaurant_name"},
  {data: "total_sales_amount", width: '110', render: simpleCurrencyLabel},
  {data: "total_food_tax", width: '110', render: simpleCurrencyLabel},
  {data: "total_liquor_tax", width: '110', render: simpleCurrencyLabel},
  {data: "total_generic_tax", width: '110', render: simpleCurrencyLabel},
  {data: "total_convenience_fee", width: '110', render: simpleCurrencyLabel},
];

const salesReportGridHeadings = [
  '#',
  'Restaurant',
  'Sales Amount',
  'Food Tax',
  'Liquor Tax',
  'Generic Tax',
  'Convenience Charges',
];

@Component({
  selector: 'app-sales-report',
  templateUrl: './sales-report.component.html',
  styleUrls: ['./sales-report.component.scss']
})
export class SalesReportComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DatatablesNetTableComponent, { static: false }) datatablesNetTable!: DatatablesNetTableComponent;
  private source = interval(2000);
  private sourceSubscription: Subscription;
  rowsCount = 0;
  headingColumnsCount = salesReportGridHeadings.length;

  selectedDateRange: { startDate: moment.Moment; endDate: moment.Moment; };
  maxDate: moment.Moment;
  selectedYear: string | null = null;
  reportYears: {value_text: string; display_text: string}[];
  selectedMonth: string | null = null;
  reportMonths: {value_text: string; display_text: string}[];
  selectedDate: string | null = null;
  reportDates: {value_text: string; display_text: string}[];
  selectedRestaurantId: string | number | null = null;
  reportRestaurants: {id: number; name: string, last_sales_date: string | null, days_since_last_sale: number | null}[];
  private lastWeek = false;
  private last30days = false;
  tableTitle = 'Report (No criteria)';
  restaurantName = '';

  disableDateRangeBox = true;
  disableSalesYearCombo = true;
  disableSalesMonthCombo = true;
  disableSalesDateCombo = true;
  lastNnDays = 40;
  private doLastNnDays = false;

  constructor(private httpClient: HttpClient, private router: Router, private spinner: NgxSpinnerService, private httpOptionsService: HttpOptionsService) {
    this.maxDate = moment();
    this.selectedRestaurantId = '0';
    this.loadComboBoxes();
  }

  // get selectedRestaurantId(): string | null {
  //   return this.selectedRestaurantId;
  // }
  //
  // set selectedRestaurantId(value: string | null) {
  //   this.selectedRestaurantId = value;
  //   this.onSalesRestaurantChange();
  // }

  private getSelectedRestaurantId = () => {
    let selectedId = -1;
    if (this.selectedRestaurantId != null) {
      if (typeof this.selectedRestaurantId === 'string' && this.selectedRestaurantId.length > 0) {
        selectedId = parseInt(this.selectedRestaurantId, 10);
      }
      if (typeof this.selectedRestaurantId === 'number' && this.selectedRestaurantId > 0) {
        selectedId = this.selectedRestaurantId;
      }
    }
    return selectedId;
  };

  ngOnInit() {
    this.spinner.show();
  }

  ngAfterViewInit() {
    this.selectedYear = "";
    this.selectedMonth = "";
    this.selectedDate = "";
    this.initializeDatatable();
  }

  ngOnDestroy(): void {
    if (this.sourceSubscription != null) {
      this.sourceSubscription.unsubscribe();
      this.sourceSubscription = null;
    }
  }

  initializeDatatable() {
    this.sourceSubscription = this.source.subscribe((event: any) => {
      if (this.datatablesNetTable != null) {
        const that = this;
        this.datatablesNetTable.setHeadings(salesReportGridHeadings);
        this.datatablesNetTable.setDtOptions({
          columns: salesReportGridColumnList,
          order: [[2, "desc"], [1, "asc"]],
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

            this.restaurantName = 'All restaurants';
            const selectedId = this.getSelectedRestaurantId();
            if (selectedId > 0) {
              dataTablesParameters['restaurantId'] = selectedId;
              this.restaurantName = this.reportRestaurants.find(r => r.id === selectedId).name;
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

            if (this.doLastNnDays) {
              dataTablesParameters['lastNDays'] = this.lastNnDays;
              this.tableTitle = `Report for last ${this.lastNnDays} days`;
            }

            that.httpClient
              // .post<DataTablesResponse>(`${environment.apiUrl}` + "/user/getorders?res_id=" + this.resId + "&loggedInUser_Id=" + this.userid + "&userid=" + this.userid, dataTablesParameters, { })
              .post<DataTablesResponse>(`${environment.apiUrl}/api/salesReport`, dataTablesParameters, this.httpOptionsService.makeHttpRequestOptionsWithAuthentication())
              .subscribe(resp => {
                  // console.log('resp++++++++: ', resp);
                  const listData = [];
                  if (!isNullOrEmpty(resp.data)) {
                    this.rowsCount = resp.data.length;
                    resp.data.forEach((element1: any, i) => {
                      const displayElement = {...element1, serial: i + 1};
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

  private loadComboBoxes(skipRestaurants: boolean = false) {
    let selectedId = this.getSelectedRestaurantId();

    if (selectedId > 0) {
      let url1 = `${environment.apiUrl}/api/salesReportCalendar`;
      if (selectedId > 0) {
        url1 = `${environment.apiUrl}/api/salesReportCalendar?restaurantId=${selectedId}`;
      }
      this.httpClient
        .get<any>(url1, this.httpOptionsService.makeHttpRequestOptionsWithoutAuthentication())
        .subscribe(resp => {
          // console.log('years', resp.data);
          if (resp.status) {
            if (resp.data.length > 0) {
              this.disableSalesYearCombo = false;
              this.disableDateRangeBox = false;
              this.reportYears = resp.data;
            }
          }
        });

      let url2 = `${environment.apiUrl}/api/salesReportCalendar?months=yes`;
      if (selectedId > 0) {
        url2 = `${environment.apiUrl}/api/salesReportCalendar?months=yes&restaurantId=${selectedId}`;
      }
      this.httpClient
        .get<any>(url2, this.httpOptionsService.makeHttpRequestOptionsWithoutAuthentication())
        .subscribe(resp => {
          // console.log('months', resp.data);
          if (resp.status) {
            if (resp.data.length > 0) {
              this.disableSalesMonthCombo = false;
              this.reportMonths = resp.data;
            }
          }
        });

      let url3 = `${environment.apiUrl}/api/salesReportCalendar?dates=yes`;
      if (selectedId > 0) {
        url3 = `${environment.apiUrl}/api/salesReportCalendar?dates=yes&restaurantId=${selectedId}`;
      }
      this.httpClient
        .get<any>(url3, this.httpOptionsService.makeHttpRequestOptionsWithoutAuthentication())
        .subscribe(resp => {
          // console.log('dates', resp.data);
          if (resp.status) {
            if (resp.data.length > 0) {
              this.disableSalesDateCombo = false;
              this.reportDates = resp.data;
            }
          }
        });
    }

    if (!skipRestaurants) {
      this.httpClient
        .get<any>(`${environment.apiUrl}/api/salesReportRestaurants`, this.httpOptionsService.makeHttpRequestOptionsWithoutAuthentication())
        .subscribe(resp => {
          // console.log('restaurants', resp.data);
          if (resp.status) {
            this.reportRestaurants = resp.data;
          }
        });
    }
  }

  resetFilters() {
    this.selectedDateRange = null;
    this.selectedYear = "";
    this.selectedMonth = "";
    this.selectedDate = "";
    // this.selectedRestaurantId = null;
    this.lastWeek = false;
    this.last30days = false;
    this.datatablesNetTable.rerender();
  }

  onSalesYearChange() {
    this.selectedDateRange = null;
    this.selectedMonth = "";
    this.selectedDate = "";
    // this.selectedRestaurantId = null;
    this.lastWeek = false;
    this.last30days = false;
  }

  onSalesMonthChange() {
    this.selectedDateRange = null;
    this.selectedYear = "";
    this.selectedDate = "";
    // this.selectedRestaurantId = null;
    this.lastWeek = false;
    this.last30days = false;
  }

  onSalesDateChange() {
    this.selectedDateRange = null;
    this.selectedYear = "";
    this.selectedMonth = "";
    // this.selectedRestaurantId = null;
    this.lastWeek = false;
    this.last30days = false;
  }

  inputChanged(evt: Object) {
    this.selectedYear = "";
    this.selectedMonth = "";
    this.selectedDate = "";
    // this.selectedRestaurantId = null;
    this.lastWeek = false;
    this.last30days = false;
  }

  onSalesRestaurantChange() {
    this.loadComboBoxes(true);
    const selectedRestaurantData = this.reportRestaurants.filter(r => r.id === Number(this.selectedRestaurantId))[0];
    this.lastNnDays = selectedRestaurantData.days_since_last_sale || 40;
    this.selectedDateRange = null;
    this.selectedYear = "";
    this.selectedMonth = "";
    this.selectedDate = "";
    this.lastWeek = false;
    this.last30days = false;
  }

  handleCriteria(option: string) {
    this.selectedDateRange = null;
    this.selectedYear = "";
    this.selectedMonth = "";
    this.selectedDate = "";
    // this.selectedRestaurantId = null;
    this.lastWeek = option === 'last-week';
    this.last30days = option === 'last-30-days';
    if (option === 'last-nn-days') {
      this.doLastNnDays = true;
    }
    this.datatablesNetTable.rerender();
  }

}
