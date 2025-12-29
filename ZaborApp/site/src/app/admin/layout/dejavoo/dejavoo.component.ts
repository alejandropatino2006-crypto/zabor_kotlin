import {
  AfterViewInit,
  Component,
  OnDestroy,
  OnInit,
  ViewChild,
  TemplateRef,
} from "@angular/core";
import { FormBuilder, FormGroup, NgForm, Validators } from "@angular/forms";
import Swal from "sweetalert2";
import * as Swaldata from "../../../shared/helpers/swalFunctionsData";
import { NgxSpinnerService } from "ngx-spinner";
// import { adminService } from "./../../../shared/services/admin.service";
import { Reader, Location } from "@stripe/terminal-js";

import {
  isErrorResponse,
  TerminalLocationRequest,
  TerminalReaderRequest,
} from "../../../shared/terminal/api-client";
import { Router } from "@angular/router";
import { DataTableDirective } from "angular-datatables";
import { Subject } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { DataTablesResponse } from "src/app/shared/class/data-table-response";
import { environment } from "src/environments/environment";
import { HttpOptionsService } from '../../../shared/services/http-options.service';
import { MyDataTablesSettings, DatatablesNetConfig, DatatablesNetConfigColumns, DatatablesNetApi } from '../../../../typings';

@Component({
  selector: "app-dejavoo",
  templateUrl: "./dejavoo.component.html",
  styleUrls: ["./dejavoo.component.scss"],
})
export class DejavooComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  dtOptions: MyDataTablesSettings = {};
  dtTrigger: any = new Subject<any>();
  terminalList = [];

  useSimulatedTerminal = false;
  restoreValues: {
    label: string;
    registration_code: string;
  };
  discoveredReadersList: Reader[] = [];
  showDiscoveryResults = false;
  canRegister = false;
  discovering = false;
  registering = false;
  locationsList: Location[] = [];

  currentLocation: Location;
  locationForm: FormGroup;
  canDiscover = false;
  locationFormTitle = "Register a new location";
  canRegisterLocation = true;
  canUpdateLocation = false;
  discoveredOnce = false;
  submittingLocation = false;

  @ViewChild("locationFormWrapper", { static: true })
  locationFormWrapperTemplate: TemplateRef<any>;
  @ViewChild("discoverWrapper", { static: true })
  discoverWrapperTemplate: TemplateRef<any>;

  constructor(
    private http: HttpClient,
    private routingRouter: Router,
    private spinner: NgxSpinnerService,
    private httpOptionsService: HttpOptionsService
  ) {}

  ngOnInit() {
    this.loadTerminals();
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next();
  }

  ngOnDestroy(): void {}

  private loadTerminals() {
    this.spinner.show();
    const that = this;
    this.dtOptions = {
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        that.http
          .get<DataTablesResponse>(
            `${environment.apiUrl}` + "/api/get-dejavoo-terminals-for-datatable", this.httpOptionsService.makeHttpRequestOptionsWithAuthentication()
          )
          .subscribe(
            (resp) => {
              this.terminalList = resp.data;

              console.log("dejavoo-terminals", this.terminalList);
              console.log("resp", resp);

              callback({
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                data: [],
              });
            },
            (error) => {
              this.routingRouter.navigate(["admin/dashboard"]);
              Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
            }
          )
          .add(() => {
            this.spinner.hide();
          });
      },
      columns: [
        { data: "id" },
        { data: "rest_id" },
        { data: "device_id" },
        { data: "device_name" },
        { data: "tpn" },
        { data: "register_id" },
        { data: "authkey" },
        { data: "security_key" },
        { data: "action", searchable: false, orderable: false },
      ],
      order: [[1, "desc"]],
    };
  }

  private reload() {
    // this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
    this.dtElement.dtInstance.then((dtInstance: DatatablesNetApi<any>) => {
      dtInstance.ajax.reload();
    });
  }

  doUnlink(id) {
    Swal.fire(Swaldata.SwalConfirm("Are You sure you want to unlink the device with the restaurant?")).then((result) => {
      console.log("result from swal", result);
      if (result.isConfirmed) {
        this.spinner.show();
        this.http.get(`${environment.apiUrl}/api/unlink-terminal/?id=${id}`).subscribe(
          (data: any) => {
            if (data.status) {
              Swal.fire(Swaldata.SwalSuccessToast('Terminal unlinked successfully'));
              this.reload();
              this.spinner.hide();
            } else {
              Swal.fire(Swaldata.SwalErrorToast(data.message));
            }
          }
        );
      }
    });
  }

  doDelete(id) {
    Swal.fire(Swaldata.SwalConfirm("Are You sure you want to delete the terminal?")).then((result) => {
      console.log("result from swal", result);
      if (result.isConfirmed) {
        this.spinner.show();
        this.http.delete(`${environment.apiUrl}/api/delete-dejavoo-terminal/?id=${id}`).subscribe(
          (data: any) => {
            if (data.status) {
              Swal.fire(Swaldata.SwalSuccessToast('Terminal deleted successfully'));
              this.reload();
              this.spinner.hide();
            } else {
              Swal.fire(Swaldata.SwalErrorToast(data.message));
            }
          }
        );
      }
    });
  }
}
