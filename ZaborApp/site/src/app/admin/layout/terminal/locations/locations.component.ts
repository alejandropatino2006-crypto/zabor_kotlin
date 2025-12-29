import { AfterViewInit, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DataTableDirective } from 'angular-datatables';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DataTablesResponse } from 'src/app/shared/class/data-table-response';
import { environment } from 'src/environments/environment';
import {NgxSpinnerService} from 'ngx-spinner';
import {ActivatedRoute, Router} from '@angular/router';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../../shared/helpers/swalFunctionsData';
import { Reader } from '@stripe/terminal-js';
import { PaymentsManager } from '../../../../shared/terminal/payments-manager';
import { HttpOptionsService } from '../../../../shared/services/http-options.service';
import { MyDataTablesSettings, DatatablesNetConfig, DatatablesNetConfigColumns, DatatablesNetApi } from '../../../../../typings';

@Component({
  selector: 'app-locations',
  templateUrl: './locations.component.html',
  styleUrls: ['./locations.component.scss']
})
export class LocationsComponent implements OnInit, AfterViewInit, OnDestroy {
  // Datatable variables
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;
  dtOptions: MyDataTablesSettings = {};
  dtTrigger: any = new Subject<any>();
  locationsList: Array<any> = [];
  accountId = "";


  constructor(
    private http: HttpClient,
    private routingRouter: Router,
    private spinner: NgxSpinnerService,
    private route: ActivatedRoute,
    private httpOptionsService: HttpOptionsService
  ) {
  }

  ngOnInit() {
    this.accountId = this.route.snapshot.paramMap.get("accountid");
    this.loadLocations();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {
  }

  private loadLocations() {
    this.spinner.show();
    const that = this;
    this.dtOptions = {

      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        that.http
          .get<DataTablesResponse>(`${environment.apiUrl}` + "/pmt/search-account?accountId=" + this.accountId, this.httpOptionsService.makeHttpRequestOptionsWithAuthentication())
          .subscribe(resp => {
          this.locationsList = resp.data;

          console.log("locationsList", this.locationsList);

          callback({
              recordsTotal: resp.recordsTotal,
              recordsFiltered: resp.recordsFiltered,
              data: [],
            });
          },
          error => {
            this.routingRouter.navigate(['admin/dashboard']);
            Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
          }).add(() => {
            this.spinner.hide();
          });
      },
      columns: [
        { data: "id" },
        { data: "display_name" },
        { data: "address.country" },
        { data: "address.city" },
        { data: "address.state" },
        { data: "address.postal_code" },
        { data: "livemode" },
        { data: "action", searchable: false, orderable: false },
      ],
      order: [[1, "desc"]]
    };
  }
}
