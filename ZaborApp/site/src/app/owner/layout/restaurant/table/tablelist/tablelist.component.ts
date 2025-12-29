import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import { RestaurantService } from '../../../../../shared/services/restaurant.service';
import { NgxSpinnerService } from "ngx-spinner";
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DataTablesResponse } from '../../../../../shared/class/data-table-response';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../../../shared/helpers/swalFunctionsData';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { noOnlyWhitespaceValidator } from "../../../../../shared/helpers/custom.validator";
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';
import { HttpOptionsService } from '../../../../../shared/services/http-options.service';
import { MyDataTablesSettings, DatatablesNetConfig, DatatablesNetConfigColumns, DatatablesNetApi } from '../../../../../../typings';

@Component({
  selector: 'app-tablelist',
  templateUrl: './tablelist.component.html',
  styleUrls: ['./tablelist.component.scss']
})
export class TablelistComponent implements OnInit, AfterViewInit {

  addTableForm: FormGroup;
  addTablevalue: any = null;
  addAreaForm: FormGroup;
  addAreaValue: any = null;

  @ViewChild(DataTableDirective, { static: false }) dtElement: DataTableDirective;

  // dtOptions: DataTables.Settings = {};
  dtOptions: MyDataTablesSettings = {};
  dtTrigger: any = new Subject<any>();
  dataTablesDataToSend: any;
  // picUrl: string = environment.fileurl + '/';
  restaurantTableList = [];
  areasList = [];
  userid = parseInt(localStorage.getItem("currentUserId"), 10);
  restaurantId = -1;
  restaurantName = '';

  // get user id and send it with each request
  // private loggedInUser_Id = localStorage.getItem("currentUserId");

  // tslint:disable-next-line:max-line-length
  constructor(private http: HttpClient, private route: ActivatedRoute, private routingRouter: Router, private restaurantService: RestaurantService, private spinner: NgxSpinnerService, private formBuilder: FormBuilder, private translate: TranslateService, private httpOptionsService: HttpOptionsService) { }


  ngOnInit() {
    this.restaurantId = parseInt(this.route.snapshot.paramMap.get("restid"), 10);
    this.restaurantName = this.route.snapshot.paramMap.get("restname");
    console.log("restaurant id : ", this.restaurantId);
    this.getRestaurantTables();
    this.addTableForm = this.formBuilder.group({
      section_name: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(60)]],
      no_of_table: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      form_type: new FormControl('add'),
      section_id: new FormControl(-1/*, [Validators.required, Validators.min(1)]*/),
      area_id: new FormControl("", [Validators.required, Validators.min(1)]),
      guest_capacity: new FormControl(1, [Validators.required, Validators.min(1), Validators.max(10)]),
    });
    this.addAreaForm = this.formBuilder.group({
      area_name: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(60)]],
      area_pk: new FormControl(-1/*, [Validators.min(1)]*/),
      area_form_type: new FormControl('add'),
    });
  }

  handleBackClicked(evt: MouseEvent) {
    evt.preventDefault();
    this.routingRouter.navigate(['owner', 'restaurants', 'list']);
  }

  getRestaurantTables() {
    console.log("getRestaurantTables is called");
    this.spinner.show();
    const that = this;
    this.dtOptions = {
      pageLength: 10,
      serverSide: true,
      processing: true,
      destroy: true,
      ajax: (dataTablesParameters: any, callback) => {
        console.log('dataTablesParameters', dataTablesParameters);

        const dataToSend = {
          ...dataTablesParameters,
          restro_id: this.restaurantId // Add the restid property
        };
        console.log('dataToSend', dataToSend);

        that.http
          .post<DataTablesResponse>(`${environment.apiUrl}` + "/user/getrestrotablebyid?userid=" + this.userid, dataToSend, this.httpOptionsService.makeHttpRequestOptionsWithAuthentication())
          .subscribe(resp => {
            console.log("DB response: ", resp);
            if (resp.status) {
              that.restaurantTableList = (resp.data as any).table_list;
              callback({
                recordsTotal: resp.recordsTotal,
                recordsFiltered: resp.recordsFiltered,
                data: [],
              });
            } else {
              Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
            }
          },
            error => {
              // this.routingRouter.navigate(['owner/dashboard']);
              Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
            }).add(() => {
              this.spinner.hide();
            });
      },
      columns: [
        { data: "#", searchable: false, orderable: false },
        { data: "section_name" },
        { data: "no_of_table", searchable: false, orderable: false },
        { data: "area_name", searchable: true, orderable: true },
        { data: "guest_capacity", searchable: false, orderable: false },
        { data: "created_at" },
        { data: "action", searchable: false, orderable: false }
      ],
      order: [[3, "desc"]]
    };
  }

  ngAfterViewInit(): void {
    this.dtTrigger.next(null);
  }

  rerender(): void {
    // this.dtElement.dtInstance.then((dtInstanceCurr: DataTables.Api) => {
    this.dtElement.dtInstance.then((dtInstanceCurr: DatatablesNetApi<any>) => {
      // Destroy the table first
      dtInstanceCurr.destroy();
      // Call the dtTrigger to rerender again
      this.dtTrigger.next(null);
      // this.dtElement.dtInstance.then((dtInstance: DataTables.Api) => {
      this.dtElement.dtInstance.then((dtInstance: DatatablesNetApi<any>) => {
        dtInstance.on('draw.dt', () => {
          if ($('.dataTables_empty').length > 0) {
            $('.dataTables_empty').remove();
          }
        });
      });
    });
  }

  openModel(restauranttable: any) {
    this.http
      .get<any>(`${environment.apiUrl}` + "/api/restroareas?restro_id=" + this.restaurantId, this.httpOptionsService.makeHttpRequestOptionsWithAuthentication())
      .subscribe(resp => {
        console.log("DB response: ", resp);
        if (resp.status) {
          if (resp.data.length > 0) {
            this.areasList = resp.data.map(item => ({id: item.id, name: item.area_name}));

            ($('#addTableModal') as any).modal('show');
            if (restauranttable === -1) {
              this.addTableForm.get('form_type').setValue('add');
              this.addTableForm.get('section_id').setValue(-1);
            } else {
              this.addTableForm.get('form_type').setValue('edit');
              this.addTableForm.get('section_id').setValue(restauranttable.section_id);
              this.addTableForm.get('section_name').setValue(restauranttable.section_name);
              this.addTableForm.get('no_of_table').setValue(restauranttable.no_of_table);
              this.addTableForm.get('area_id').setValue(restauranttable.area_id);
              this.addTableForm.get('guest_capacity').setValue(restauranttable.guest_capacity);
            }
          } else {
            alert("No areas exist for tables. Add a new area first");
            this.openAreaModel();
          }
        } else {
          Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
        }
      });
  }

  openAreaModel() {
      ($('#addAreaModal') as any).modal('show');
      this.addAreaForm.get('area_form_type').setValue('add');
      this.addAreaForm.get('area_pk').setValue(-1);
  }

  deleteTableRow(restauranttable: any) {
    Swal.fire({
      title: 'Are you sure want to delete the table',
      text: "Deleting the table : " + restauranttable.section_name,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes'
    }).then((result) => {
      if (result.value) {
        this.spinner.show();
        const tableURL = `${environment.apiUrl}` + "/user/deleterestrotable?userid=" + this.userid;
        const dataToSend = {
          table_id: restauranttable.section_id
        };
        this.http
              .post<DataTablesResponse>(tableURL, dataToSend, {})
              .subscribe(resp => {
                console.log("resList: ", resp);
                if (resp.status) {
                  this.rerender();
                }
              },
                error => {
                  // this.routingRouter.navigate(['owner/dashboard']);
                  Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
                }).add(() => {
                  this.spinner.hide();
                });
      }
    });
  }

  submitTableform() {
    this.addTablevalue = this.addTableForm.value;
    console.log("addTablevalue", this.addTablevalue);
    this.spinner.show();
    const form_type = this.addTablevalue.form_type;
    let dataToSend = {};
    let tableURL = "";
    if (form_type === "add") {
      dataToSend = {
        restro_id: this.restaurantId,
        section_name: this.addTablevalue.section_name,
        no_of_table: this.addTablevalue.no_of_table,
        area_id: this.addTablevalue.area_id,
        guest_capacity: this.addTablevalue.guest_capacity,
      };
      tableURL = `${environment.apiUrl}` + "/user/addrestrotable?userid=" + this.userid;
    }

    if (form_type === "edit") {
      dataToSend = {
        restro_id: this.restaurantId,
        section_name: this.addTablevalue.section_name,
        no_of_table: this.addTablevalue.no_of_table,
        section_id: this.addTablevalue.section_id,
        area_id: this.addTablevalue.area_id,
        guest_capacity: this.addTablevalue.guest_capacity,
      };
      tableURL = `${environment.apiUrl}` + "/user/updaterestrotable?userid=" + this.userid;
    }

    console.log('dataToSend', dataToSend);
    this.http
          .post<DataTablesResponse>(tableURL, dataToSend, this.httpOptionsService.makeHttpRequestOptionsWithAuthentication())
          .subscribe(resp => {
            console.log("resList: ", resp);
            if (resp.status) {
              Swal.fire(Swaldata.SwalSuccessToast(resp.msg));
              // this.getRestaurantTables();
              // this.rerender();
              this.addTableForm.controls['section_name'].setValue('');
              this.addTableForm.controls['no_of_table'].setValue(1);
              this.addTableForm.controls['area_id'].setValue('');
              this.addTableForm.controls['guest_capacity'].setValue(1);
              this.rerender();
              ($('#addTableModal') as any).modal('hide');
            } else {
              Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
            }
          },
            error => {
              // this.routingRouter.navigate(['owner/dashboard']);
              Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
            }).add(() => {
              this.spinner.hide();
            });
  }

  submitAreaForm() {
    this.addAreaValue = this.addAreaForm.value;
    console.log("addAreaValue", this.addAreaValue);
    const area_form_type = this.addAreaValue.area_form_type;
    if (!(area_form_type === 'add' || area_form_type === 'edit')) {
      alert("Invalid form state");
      return;
    }

    this.spinner.show();
    let dataToSend = {};
    let tableURL = "";
    if (area_form_type === "add") {
      dataToSend = {
        restro_id: this.restaurantId,
        area_name: this.addAreaValue.area_name,
      };
      tableURL = `${environment.apiUrl}` + "/api/restroarea?userid=" + this.userid;
    }

    if (area_form_type === "edit") {
      dataToSend = {
        restro_id: this.restaurantId,
        area_name: this.addAreaValue.area_name,
      };
      tableURL = `${environment.apiUrl}` + "/api/restroarea/" + this.addAreaValue.area_pk;
    }

    console.log('dataToSend', dataToSend);
    const apiObservable = area_form_type === "edit" ?
      this.http.put<any>(tableURL, dataToSend, this.httpOptionsService.makeHttpRequestOptionsWithAuthentication())
      : this.http.post<any>(tableURL, dataToSend, this.httpOptionsService.makeHttpRequestOptionsWithAuthentication());
    apiObservable
          .subscribe(resp => {
            console.log("DB response: ", resp);
            if (resp.status) {
              Swal.fire(Swaldata.SwalSuccessToast(resp.msg));
              if (area_form_type === "add") {
                // resp.data.newRecordId
              }
            } else {
              Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
            }
          },
            error => {
              // this.routingRouter.navigate(['owner/dashboard']);
              Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
            }).add(() => {
              this.addAreaForm.controls['area_name'].setValue('');
              this.rerender();
              ($('#addAreaModal') as any).modal('hide');
              this.spinner.hide();
            });
  }

}
