import { AfterViewInit, ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { RestaurantService } from "../../../../shared/services/restaurant.service";
import { NgxSpinnerService } from "ngx-spinner";
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from '../../../../../environments/environment';
import { of, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DataTablesResponse } from '../../../../shared/class/data-table-response';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../../shared/helpers/swalFunctionsData';
import { TranslatePipe } from '@ngx-translate/core';
import { DatatableLanguage } from '../../../../shared/helpers/dataTableLanguages';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../../../shared/services/translation.service';
import { ClientStorageService } from '../../../../shared/services/client-storage.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MustMatch } from '../../../../shared/helpers/custom.validator';
import { catchError, map } from 'rxjs/operators';
import { HttpOptionsService } from '../../../../shared/services/http-options.service';
import { MyDataTablesSettings, DatatablesNetConfig, DatatablesNetConfigColumns, DatatablesNetApi } from '../../../../../typings';

@Component({
  selector: 'app-employees',
  templateUrl: './employees.component.html',
  styleUrls: ['./employees.component.scss']
})
export class EmployeesComponent implements OnInit, AfterViewInit {

  @ViewChild(DataTableDirective, { static: false })
  dtElement: DataTableDirective;

  // dtOptions: DataTables.Settings = {};
  dtOptions: MyDataTablesSettings = {};
  dtTrigger: any = new Subject<any>();
  // pic_url = environment.fileurl + '/';
  employeeList = [];
  userid = parseInt(localStorage.getItem("currentUserId"), 10);
  // private loggedInUser_Id = localStorage.getItem("currentUserId");
  currentLang: any;
  restaurantId: number;
  passwordForm: FormGroup;
  currentEmployeeId: number;

  constructor(
    private http: HttpClient,
    private restaurantService: RestaurantService,
    private spinner: NgxSpinnerService,
    public translation: TranslationService,
    private translate: TranslateService,
    private changeDetector: ChangeDetectorRef,
    private route: ActivatedRoute,
    private httpOptionsService: HttpOptionsService,
    private formBuilder: FormBuilder,
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
    this.getEmployees();

    this.passwordForm = this.formBuilder.group({
      password: ["", [Validators.required, Validators.minLength(6)]],
      confirmPassword: ["", Validators.required]
    },
      {
        validator: MustMatch("password", "confirmPassword")
      });

    this.passwordForm.get('password').valueChanges.subscribe(password => {
      if (password) {
        this.checkEmployeePasswordAlreadyExist(password);
      } else {
        // Reset password error if the field is empty
        this.passwordForm.get('password').setErrors(null);
      }
    });
  }

  onSubmit() {
    console.log(this.passwordForm);
    if (this.passwordForm.invalid) {
      console.log(this.passwordForm);
      return;
    }
    this.spinner.show();
    const formData = new FormData();
    Object.entries(this.passwordForm.value).forEach(
      ([key, value]: any[]) => {
        formData.set(key, value);
      }
    );
    formData.set('userid', this.currentEmployeeId.toString());
    this.restaurantService.changePassword(formData).subscribe(
      data => {
        if (data.status) {
          Swal.fire(Swaldata.SwalSuccessToast(data.msg));
          ($('#passwordChangeModal') as any).modal('hide');
        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.msg));
        }
      },
      error => {
        Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("There seems to be a problem with the employee data you entered. Please double-check the information and try again.")));
      }
    ).add(() => {
      this.spinner.hide();
    });
  }

  checkEmployeePasswordAlreadyExist(password: string) {
    if (password.length >= 6) {
      // Call your service to check password existence with restaurantId
      this.restaurantService.checkEmployeePasswordExists({ password, rest_id: this.restaurantId, userid: this.currentEmployeeId })
        .pipe(
          map(response => {
            if (response.status) {
              return { passwordExists: false };
            } else {
              return { passwordExists: true };
            }
          }),
          catchError(() => of({ passwordExists: true })) // Handle errors as password exists
        )
        .subscribe(result => {
          if (result.passwordExists) {
            this.passwordForm.get('password').setErrors({ passwordExists: true });
          } else {
            // Handle the case where the password does not exist
            // You can implement your desired logic here
            console.log('Password does not exist');
          }
        });
    }
  }

  updateDtOptions() {
    console.log("current lang in update options", this.currentLang);
    this.dtOptions.language = this.currentLang === "es" ? DatatableLanguage.datatableSpanish : DatatableLanguage.datatableEnglish;
    console.log("this.dtOptions", this.dtOptions.language);
    this.changeDetector.detectChanges();
  }

  getEmployees() {
    this.spinner.show();
    const that = this;
    this.dtOptions = {
      language: (this.currentLang === "es") ? DatatableLanguage.datatableSpanish : DatatableLanguage.datatableEnglish,
      pageLength: 10,
      serverSide: true,
      processing: true,
      ajax: (dataTablesParameters: any, callback) => {
        console.log('dataTablesParameters', dataTablesParameters);
        that.http
          .get<DataTablesResponse>(`${environment.apiUrl}/user/getemployeelist?userid=${this.userid}&restid=${this.restaurantId}`, this.httpOptionsService.makeHttpRequestOptionsWithAuthentication())
          .subscribe({
            next: (resp: any) => {
              console.log("employee list1: ", resp);
              that.employeeList = resp.data;
              console.log("employee list2: ", resp.data);
              let recordsTotal = 0;
              let recordsFiltered = 0;
              if (resp.status) {
                that.employeeList = resp.data;
                recordsTotal = resp.recordsTotal;
                recordsFiltered = resp.recordsFiltered;
              }

              callback({
                recordsTotal,
                recordsFiltered,
                data: [],
              });
            },
            error: (error) => {
              Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Employee List has some error.")));
              this.spinner.hide();
            },
            complete: () => {
              this.spinner.hide();
            }
          });
      }, columns: [
        // { data: "#", searchable: false, orderable: false },
        { data: "id", searchable: false, orderable: false },
        { data: "name", searchable: false, orderable: false },
        { data: "email" },
        { data: "phone" },
        { data: "status" },
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
        dtInstance.on('draw.dt', function() {
          if ($('.dataTables_empty').length > 0) {
            $('.dataTables_empty').remove();
          }
        });
      });
    });
  }

  changePassword(event, employeeId) {
    event.preventDefault();
    this.passwordForm.reset();
    this.currentEmployeeId = employeeId;
    ($('#passwordChangeModal') as any).modal('show');
  }


  deleteEmployee(event, employeeId) {
    event.preventDefault();
    Swal.fire(Swaldata.SwalConfirm(this.translate.instant("Are you sure you want to delete this employee?"))).then((result) => {
      if (result.value) {
        console.log(result.value, employeeId);
        if (result.value) {
          this.spinner.show();
          this.restaurantService.deleteEmployee(employeeId).subscribe(
            data => {
              if (data.status) {
                this.rerender();
                Swal.fire(Swaldata.SwalSuccessToast(this.translate.instant('Employee delete succefully!')));
              } else {
                Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Problem deleting Employee!')));
              }
            },
            error => {
              Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Problem deleting Employee!')));
            }
          ).add(() => {
            this.spinner.hide();
          });
        }
      }
    });
  }



}
