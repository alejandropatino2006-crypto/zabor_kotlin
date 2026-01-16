import { AfterViewInit, Component, HostListener, Input, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RestaurantService } from '../../../services/restaurant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DataTablesResponse } from '../../../class/data-table-response';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../helpers/swalFunctionsData';
import { defaultDropdownSettings, fromCamelToTitleCase, fromSnakeToTitleCase, isNullOrEmpty } from '../../../helpers/commonFunctions';
import * as moment from 'moment';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TranslateService } from '@ngx-translate/core';
import { DatatableLanguage } from 'src/app/shared/helpers/dataTableLanguages';
import { TranslationService } from '../../../services/translation.service';
import { HttpOptionsService } from '../../../services/http-options.service';
import { MyDataTablesSettings, DatatablesNetConfig, DatatablesNetConfigColumns, DatatablesNetApi } from '../../../../../typings';

function escapeHtml(text: string) {
  const escapeHtmlEntityMap = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;",
    "/": "&#x2F;",
    "`": "&#x60;",
    "=": "&#x3D;",
  };

  return String(text).replace(/[&<>"'`=\/]/g, function(s) {
    // @ts-ignore
    return escapeHtmlEntityMap[s];
  });
}

function simpleLink(data, type, full, meta) {
  if (type === "display") {
    let clickLink = '<a class="link-label-in-table link-generated-at-runtime"';
    // clickLink += ' data-row="' + escapeHtml(JSON.stringify(full)) + '"';
    clickLink += ` href="/owner/restaurants/edit/${full.res_id}"`;
    clickLink += `>${full.res_name}</a>`;
    return clickLink;
  }
  return data;
}

function simpleColoredLabel(data, type, full, meta) {
  if (type === "display") {
    // <span class="status-td"
    //                   [ngClass]="{'dark-danger':order.status==='cancelled','danger':order.status==='paymentfailed','primary':order.status==='received' ,'warning':order.status==='preparing',
    //                   'info':order.status==='ready','dark':order.status==='pickup','success':order.status==='delivered'}">{{order.status | titlecase}}</span>
    let textColorClass = "";
    let orderStatus = full.status;
    if (orderStatus === "cancelled") { textColorClass = "dark-danger"; }
    if (orderStatus === "paymentfailed") {
      textColorClass = "danger";
      orderStatus = "payment failed";
    }
    if (orderStatus === "received") { textColorClass = "primary"; }
    if (orderStatus === "preparing") { textColorClass = "warning"; }
    if (orderStatus === "ready") { textColorClass = "info"; }
    if (orderStatus === "pickup") { textColorClass = "dark"; }
    if (orderStatus === "delivered") { textColorClass = "success"; }
    let clickLink = `<span class="status-td status-label-in-table${
      !!textColorClass ? " " + textColorClass : ""
    }"`;
    // clickLink += ' data-row="' + escapeHtml(JSON.stringify(full)) + '"';
    clickLink += `>${orderStatus}</span>`;
    return clickLink;
  }
  return data;
}

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

function simpleButtonEditOrDetail(data, type, full, meta) {
  if (type === "display") {
    // const title = `Edit order ID # ${full.orderid}`;
    // let btn = '<button title="' + title + '" type="button" class="btn btn-primary m-0 p-0 px-2" onclick="handleRowEditClick(this)"';
    // btn += ' data-row="' + escapeHtml(JSON.stringify(full)) + '"';
    // btn += ' value="Edit"';
    // // btn += '><i class="fa fa-trash-alt" title="' + title + '"></i><span title="' + title + '">Remove</span></button>';
    // btn += '></button>';
    // return btn;
    let editLink =
      '<a class="btn badge btn-primary btn-sm link-generated-at-runtime"';
    // editLink += ' data-row="' + escapeHtml(JSON.stringify(full)) + '"';
    editLink += ` href="/${full.isAdmin ? "admin" : "owner"}/orders/${
      data.isAdmin ? "detail" : "edit"
    }/${data}"`;
    // editLink += ` routerLink="['/${full.isAdmin ? 'admin' : 'owner'}/orders/${data.isAdmin ? 'detail' : 'edit'}/${data}']"`;
    editLink += '><i class="fa fa-pencil"></i>Edit</a>';
    return editLink;
  }
  return data;
}

// const gridColumnList: DataTables.ColumnSettings[] = [
const gridColumnList: DatatablesNetConfigColumns[] = [
  // {
  //   "width": '80',
  //   "render": function (data, type, full, meta: any) {
  //     console.log(meta.settings._iDisplayStart, meta.row);
  //     return meta.row + meta.settings._iDisplayStart + 1;
  //   },
  // },
  { data: "serial", width: "30" },
  { data: "orderid", width: "70" },
  { data: "username" },
  { data: "res_name", width: "260", render: simpleLink },
  { data: "created_at", width: "100" },
  { data: "status", width: "102", render: simpleColoredLabel },
  { data: "deliveryMode", width: "110" },
  { data: "orderTotal", width: "80", render: simpleCurrencyLabel },
  { data: "edit", width: "140", render: simpleButtonEditOrDetail },
];


@Component({
  selector: "app-orders",
  templateUrl: "./orders.component.html",
  // tslint:disable-next-line:max-line-length
  // styles: ['.dataTables_empty { display: none; }', '.no-data-available{ text-align: center}', 'span.status-td{padding: 10px;background: rgb(229, 229, 229);border-radius: 4px;color: rgb(119, 119, 119);font-size:14px}', 'span.status-td.success{background: #c6e1c6;color: #5b841b;}', 'span.status-td.warning{background: #f8dda7;color: #94660c;}', 'span.status-td.primary{background: #c8d7e1;color: #2e4453;}', 'span.status-td.info{background: #d1ecf1; color: #0d5e7f;}', 'span.status-td.dark{background: #d6d8d9; color: #1e263e}', 'span.status-td.danger{background: #eba3a3;color: #761919;}', 'span.status-td.dark-danger,.dark-danger{color: #f5c6cb;background: #721c24;}', '.alert {padding:0.5rem 1.25rem}', 'select.ng-valid{border:1px solid #ced4da}', '.total-price{}']
})
// export class OrdersComponent implements OnInit, AfterViewInit, OnDestroy {
export class OrdersComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() resId = -1;

  @ViewChild(DataTableDirective, {static: false}) dtElement: DataTableDirective;

  // dtOptions: DataTables.Settings = {};
  dtOptions: MyDataTablesSettings = {};
  dtTrigger: any = new Subject<any>();
  // ordersList: Array<any> = [];
  userid = parseInt(localStorage.getItem("currentUserId"), 10);
  mySubscription: any;
  TypesFilters: any = {
    received: 0,
    preparing: 0,
    ready: 0,
    pickup: 0,
    delieved: 0,
    paymentfailed: 0,
    cancelled: 0,
  };
  filterTotal: any = {
    received: 0,
    preparing: 0,
    ready: 0,
    pickup: 0,
    delieved: 0,
    paymentfailed: 0,
    cancelled: 0,
  };
  orderStatus = -1;
  dropdownSettings = defaultDropdownSettings;
  statusdata: any = [
    { id: "received", itemName: "Order Received" },
    { id: "preparing", itemName: "Preparing" },
    { id: "ready", itemName: "Ready" },
    { id: "pickup", itemName: "Pickup" },
    { id: "delivered", itemName: "Delivered" },
    { id: "paymentfailed", itemName: "Payment Failed" },
    { id: "cancelled", itemName: "Cancelled" },
  ];
  selectedstatuslist: any = [];
  restaurantList: any = [];
  maxDate: moment.Moment;
  selected: { startDate: moment.Moment; endDate: moment.Moment } | null = null;
  startDate: string;
  endDate: string;
  getOrdersTotal: any;
  isAdmin = false;

  head = [
    [
      "#",
      "Order id",
      "User Name",
      "Restaurnt",
      "Created Date",
      "Status",
      "Delivery mode",
      "Total",
    ],
  ];

  data = [];
  currentLang: any;

  // TotalOrders: number = 0

  disableUi = false;

  constructor(
    private http: HttpClient,
    private routingRouter: Router,
    private restaurantService: RestaurantService,
    private spinner: NgxSpinnerService,
    public translation: TranslationService,
    private translate: TranslateService,
    private httpOptionsService: HttpOptionsService
  ) {
    this.maxDate = moment();
  }

  // convert href to router-link
  @HostListener("document:click", ["$event"])
  public handleClick(event: Event): void {
    const eventTarget = event.target;
    if (eventTarget instanceof HTMLAnchorElement) {
      const element = event.target as HTMLAnchorElement;
      if (element.classList.contains("link-generated-at-runtime")) {
        event.preventDefault();
        event.stopPropagation();
        const href = element.getAttribute("href");
        if (href != null) {
          this.routingRouter.navigate([href]);
        }
      }
    }
  }

  resetFilters(eventTarget: EventTarget) {
    this.resId = -1;
    this.orderStatus = -1;
    this.selected = null;
    // this.selected = { startDate: null, endDate: null };
    this.rerender(eventTarget);
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

    this.spinner.show();
    this.isAdmin = window.location.href.indexOf("admin") > -1;
    // get restaurant list of user
    this.restaurantService.getrestaurantslist()
      .subscribe(
        (response) => {
          // response.data.map(data => {
          //   this.restaurantList.push(data);
          // });
          console.log("resList: ", response);
          this.restaurantList = response.data;
          this.resId = this.restaurantList[0].id;
        },
        (error) => {
          Swal.fire(Swaldata.SwalErrorToast("something went wrong"));
        }
      )
      .add(() => {
        // this.spinner.hide();
        if (this.resId > 0) { this.getOrders(); }
      });

    // this.selectedstatuslist = [...this.statusdata]
  }

  // https://stackoverflow.com/a/48035157
  ngAfterViewInit() {
    this.dtTrigger.next(null);
  }

  ngOnDestroy(): void {
    // Do not forget to unsubscribe the event
    this.dtTrigger.unsubscribe();
  }

  updateDtOptions() {
    console.log("current lang in update options", this.currentLang);
    this.dtOptions.language = this.currentLang === "es" ? DatatableLanguage.datatableSpanish : DatatableLanguage.datatableEnglish;
    console.log("this.dtOptions", this.dtOptions.language);
    // this.changeDetector.detectChanges();
  }

  getOrders() {
    this.disableUi = true;
// this.spinner.show();
    const that = this;
    this.dtOptions = {
      ...this.httpOptionsService.makeDefaultGridOptions(),
      language : (this.currentLang === "es") ? DatatableLanguage.datatableSpanish : DatatableLanguage.datatableEnglish,
      columns: gridColumnList,
      columnDefs: [
        // {targets: [0, 1, 2, 3], visible: true},
        // {targets: [1, 2, 3], "searchable": true, "orderable": true},
        { targets: [1, 2, 3, 4, 5, 6, 7], searchable: true, orderable: true },
        // {targets: '_all', visible: false, "searchable": false, "orderable": false}
        { targets: "_all", searchable: false, orderable: false },
      ],
      pageLength: 50,
      lengthMenu: [
        [50, 100, 250, 500, 1000, 2500, 5000, -1],
        [50, 100, 250, 500, 1000, 2500, 5000, "All"],
      ],
      serverSide: true,
      ajax: (dataTablesParameters: any, callback) => {
        dataTablesParameters["res_id"] = this.resId;
        dataTablesParameters["status"] = this.orderStatus;

        if (
          this.selected != null &&
          this.selected.startDate &&
          this.selected.endDate
        ) {
          dataTablesParameters["startDate"] = this.startDate;
          dataTablesParameters["endDate"] = this.endDate;
        }

        const requestOptions = this.httpOptionsService.makeHttpRequestOptionsWithAuthentication();
        requestOptions.params = { res_id: "" + this.resId, loggedInUser_Id: "" + this.userid, userid: "" + this.userid};
        that.http
          .post<DataTablesResponse>(`${environment.apiUrl}/user/getorders`, dataTablesParameters, requestOptions)
          .subscribe(
            (resp) => {
              console.log("resp++++++++: ", resp);
              if (resp.status) {
                const listData = [];
                if (!isNullOrEmpty(resp.data) && Array.isArray(resp.data) && resp.data.length > 0) {
                  resp.data.forEach((element, i) => {
                    // let deliveryMode = "Dine - " + (typeof element.delivery_mode);
                    let deliveryMode = "Dine";
                    if (element.delivery_mode === 1) {
                      deliveryMode = "Home Delivery";
                    } else if (element.delivery_mode === 2) {
                      deliveryMode = "Pickup";
                    }
                    // this.data[i] = [i + 1, element.orderid, element.username, element.res_name, element.created_at, element.status, delivery_mode, "$" + element.order_total]
                    // listData.push([i + 1, element.orderid, element.username, element.res_name, element.created_at, element.status, delivery_mode, "$" + element.order_total]);
                    // listData.push({serial: i + 1, ...element});
                    const displayElement = {
                      ...element,
                      serial: i + 1,
                      id: element.orderid,
                      deliveryMode,
                      // orderTotal: "$" + element.order_total,
                      orderTotal: element.order_total,
                      edit: element.orderid,
                      detail: element.orderid,
                      isAdmin: this.isAdmin,
                    };
                    listData.push({...displayElement});
                  });
                  // that.ordersList = resp.data;
                }
                this.TypesFilters = resp.TypesFilters;
                this.getOrdersTotal = resp.getOrdersTotal;
                this.filterTotal = resp.filterTotal;

                // {
                //   "status": 200,
                //   "msg": "",
                //   "data": [],
                //   "recordsTotal": 0,
                //   "recordsFiltered": 0,
                //   "TypesFilters": {
                //     "received": 0,
                //       "preparing": 0,
                //       "ready": 0,
                //       "pickup": 0,
                //       "delivered": 0,
                //       "cancelled": 0
                //   },
                //   "getOrdersTotal": 0,
                //   "filterTotal": {
                //     "received": 0,
                //       "preparing": 0,
                //       "ready": 0,
                //       "pickup": 0,
                //       "delivered": 0,
                //       "cancelled": 0
                //   }
                // }
                callback({
                  recordsTotal: resp.recordsTotal,
                  recordsFiltered: resp.recordsFiltered,
                  data: listData,
                });
              } else {
                Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
              }
            },
            (error) => {
              // console.log("what error ", error);
              // this.routingRouter.navigate(['owner/dashboard']);
              Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
            }
          )
          .add(() => {
            this.spinner.hide();
            that.disableUi = false;
          });
      },
      // columns: [
      //   { data: "id", searchable: false, orderable: false },
      //   { data: "orderid" },
      //   { data: "username" },
      //   { data: "res_name" },
      //   { data: "created_at" },
      //   { data: "status" },
      //   { data: "Delivery mode", searchable: false, orderable: false },
      //   { data: "order_total", searchable: false, orderable: false },
      //   { data: "action", searchable: false, orderable: false },
      // ],
      order: [[1, "desc"]],
      "drawCallback": function(settings) {
        // alert('DataTables has redrawn the table');
        const api = this.api();
        api.on('length.dt', (/*_e: any, _settings: DataTables.Settings, _len: number*/) => {
          // alert('New page length: ' + len);
          that.disableUi = true;
        });
      }
    };

    // $("#orders-data-table").DataTable(this.dtOptions);

    // TODO: convert all datatables.net creation code as below
    // @ts-ignore
    this.dtElement.dtOptions = this.dtOptions;
    this.dtElement.dtTrigger.next(null);
  }

  // ngAfterViewInit(): void {
  //   this.dtTrigger.next();
  //   //in 10 seconds do something
  //   this.mySubscription = interval(60000).subscribe(x => {
  //     this.rerender();
  //   });
  // }

  // ngOnDestroy() {
  //   this.mySubscription.unsubscribe()
  // }

  rerender(eventTarget: EventTarget): void {
    this.disableUi = true;
    const that = this;
    if (this.selected != null) {
      this.startDate = moment(this.selected.startDate).format("YYYY-MM-DD");
      this.endDate = moment(this.selected.endDate).format("YYYY-MM-DD");
    }

    // this.dtElement.dtInstance.then((dtInstance1: DataTables.Api) => {
    this.dtElement.dtInstance.then((dtInstance1: DatatablesNetApi<any>) => {
      // Destroy the table first
      if (dtInstance1 != null) { dtInstance1.destroy(); }
      // Call the dtTrigger to rerender again
      this.dtTrigger.next(null);
      // this.dtElement.dtInstance.then((dtInstance2: DataTables.Api) => {
      this.dtElement.dtInstance.then((dtInstance2: DatatablesNetApi<any>) => {
        that.disableUi = false;
        if (dtInstance2 != null) {
          dtInstance2.on("draw.dt", function() {
            if ($(".dataTables_empty").length > 0) {
              $(".dataTables_empty").remove();
            }
          });
        }
      });
    });
  }

  report(eventTarget: EventTarget) {
    this.disableUi = true;
    const doc = new jsPDF({
      orientation: "portrait",
      // unit: "in",
      // format: [4, 2]
      format: "a4"
    });

    doc.setFontSize(18);
    // doc.text("Orders Table", 11, 8);
    doc.setFontSize(11);
    doc.setTextColor(100);

    // (doc as any).autoTable({
    //   head: this.head,
    //   body: this.data,
    //   theme: "plain",
    //   didDrawCell: (data) => {
    //     console.log(data.column.index);
    //   },
    // });

    // console.log('TEST', colList.slice(0, colList.length - 1).splice(2, 1));
    const colList = gridColumnList as Array<any>;
    const testList = [...colList];
    testList.splice(3, 1);
    // console.log('TEST', colList, testList, testList.slice(0, testList.length - 1));

    const dataTablesParameters: any = {};
    dataTablesParameters["res_id"] = this.resId;
    dataTablesParameters["status"] = this.orderStatus;

    if (
      this.selected != null &&
      this.selected.startDate &&
      this.selected.endDate
    ) {
      dataTablesParameters["startDate"] = this.startDate;
      dataTablesParameters["endDate"] = this.endDate;
    }

    dataTablesParameters["draw"] = 1;
    dataTablesParameters["length"] = -1;
    dataTablesParameters["start"] = -1;
    dataTablesParameters["search"] = {value: "", regex: false, fixed: []};
    dataTablesParameters["order"] = [{column: 1, dir: "desc", name: ""}];

    this.restaurantService.getAllOrders(dataTablesParameters, this.resId, this.userid).subscribe(
      reponse => {
        if (reponse.status) {
          doc.text("Table of orders list - " + reponse.data[0].res_name, 11, 8);
          autoTable(doc, {
            head: [testList.slice(0, testList.length - 1).map(h => fromSnakeToTitleCase(fromCamelToTitleCase(h.data.replace("id", "Id"))))],
            body: (reponse.data as Array<any>).map((d, i) => {
              let deliveryMode = "Dine";
              if (d.delivery_mode === 1) {
                deliveryMode = "Home Delivery";
              } else if (d.delivery_mode === 2) {
                deliveryMode = "Pickup";
              }
              return [i + 1, d.orderid, d.username/*, d.res_name*/, d.created_at, d.status, deliveryMode, '$' + d.order_total];
            }),
            theme: "plain",
            // didDrawCell: (data) => {
            //   console.log(data.column.index);
            // },
          });

          // Open PDF document in new tab
          // doc.output("dataurlnewwindow");

          // Download PDF document
          doc.save("orders_of_restaurant_" + this.resId + ".pdf");
          this.disableUi = false;
        }
      },
      error => {}
    );
  }

  // filter() {
  //   this.rerender()
  // }

  handleBackClicked(evt: MouseEvent) {
    evt.preventDefault();
    this.routingRouter.navigate(["owner", "restaurants", "list"]);
  }

  handleRestaurantChange(eventTarget: EventTarget) {
    // const selectElem = eventTarget as HTMLSelectElement;
    // this.resId = +selectElem.value;
    this.getOrders();
  }

  handleStatusChange(eventTarget: EventTarget) {
    this.getOrders();
  }
}
