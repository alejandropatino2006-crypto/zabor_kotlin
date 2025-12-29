import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  OnInit,
  ViewChild,
} from '@angular/core';
import { RestaurantService } from 'src/app/shared/services/restaurant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DataTablesResponse } from 'src/app/shared/class/data-table-response';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import * as Swaldata from 'src/app/shared/helpers/swalFunctionsData';
import { TranslateService } from '@ngx-translate/core';
import { DatatableLanguage } from 'src/app/shared/helpers/dataTableLanguages';
import { HttpOptionsService } from 'src/app/shared/services/http-options.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
})
export class CustomersComponent implements OnInit, AfterViewInit {
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  dtOptions: DataTables.Settings = {};
  dtTrigger: Subject<any> = new Subject();

  customerList = [];
  userid = parseInt(localStorage.getItem('currentUserId'), 10);
  currentLang: string;
  restaurantId: number;

  constructor(
    private http: HttpClient,
    private restaurantService: RestaurantService,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private changeDetector: ChangeDetectorRef,
    private route: ActivatedRoute,
    private httpOptionsService: HttpOptionsService
  ) {}

  ngOnInit() {
    this.restaurantId = parseInt(this.route.snapshot.paramMap.get('restid'), 10);
    this.currentLang = this.translate.currentLang;

    this.translate.onLangChange.subscribe((event) => {
      this.currentLang = event.lang;
      this.updateDtOptions();
    });

    this.getCustomers();
  }

  updateDtOptions() {
    this.dtOptions.language =
      this.currentLang === 'es'
        ? DatatableLanguage.datatableSpanish
        : DatatableLanguage.datatableEnglish;
    this.changeDetector.detectChanges();
  }

  getCustomers() {
    this.spinner.show();
    const that = this;
    this.dtOptions = {
      language:
        this.currentLang === 'es'
          ? DatatableLanguage.datatableSpanish
          : DatatableLanguage.datatableEnglish,
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        that.http
          .get<DataTablesResponse>(
            `${environment.apiUrl}/user/getcustomerlist?userid=${this.userid}&restid=${this.restaurantId}`,
            this.httpOptionsService.makeHttpRequestOptionsWithAuthentication()
          )
          .subscribe({
            next: (resp: any) => {
              if (resp.status) {
                that.customerList = resp.data;
                callback({
                  recordsTotal: resp.recordsTotal || resp.data.length,
                  recordsFiltered: resp.recordsFiltered || resp.data.length,
                  data: [],
                });
              } else {
                Swal.fire(Swaldata.SwalErrorToast(that.translate.instant('Failed to load customers.')));
              }
            },
            error: () => {
              Swal.fire(Swaldata.SwalErrorToast(that.translate.instant('Error fetching customer list.')));
              this.spinner.hide();
            },
            complete: () => {
              this.spinner.hide();
            },
          });
      },
      columns: [
        { data: 'id', searchable: false, orderable: false },
        { data: 'name' },
        { data: 'email' },
        { data: 'phone' },
        { data: 'status' },
        { data: 'action', searchable: false, orderable: false },
      ],
      order: [[1, 'asc']],
    };
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  rerender(): void {
    this.dtElement.dtInstance.then((dtInstance) => {
      dtInstance.destroy();
      this.dtTrigger.next();
    });
  }
}
