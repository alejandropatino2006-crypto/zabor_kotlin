import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { NgxSpinnerService } from "ngx-spinner";
import { RestaurantService } from "src/app/shared/services/restaurant.service";
import Swal from "sweetalert2";
import { noOnlyWhitespaceValidator } from "../../../../../shared/helpers/custom.validator";
import * as Swaldata from "../../../../../shared/helpers/swalFunctionsData";
import { catchError, finalize, map } from "rxjs/operators";
import { of } from "rxjs";

@Component({
  selector: 'app-view-employee',
  templateUrl: './view-employee.component.html',
  styleUrls: ['./view-employee.component.scss']
})
export class ViewEmployeeComponent implements OnInit {

  restaurantId: number;
  loggedInUser_Id = localStorage.getItem("currentUserId");
  employeeId: number;
  currentUser:any;
  currentEmployee:any;
  jobTitles: any = [];
  currentJobTitle: string;

  constructor(
    private _router: Router, 
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private restaurantService: RestaurantService,
    private route: ActivatedRoute,
  ) {
    
  }

  ngOnInit() {
    this.getJobTitles();
    this.restaurantId = parseInt(this.route.snapshot.paramMap.get("restid"));
    this.employeeId = parseInt(this.route.snapshot.paramMap.get("id"));
    this.loadData();
  }

  getJobTitles() {      
    this.spinner.show();
    this.restaurantService.getJobTitles().subscribe(data => {
      console.log("returned job titles data: ", data);
      if (data.status) {
        console.log("returned jobtitles details: ", data);
        this.jobTitles = data.job_titles;
        console.log("jobTitles: ", this.jobTitles);
      }
      else
        Swal.fire(Swaldata.SwalErrorToast(data.msg));
    }, error => {
      Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("There seems to be an issue with retrieving the job titles.")));
      this._router.navigate(['/owner/restaurants']);
    }).add(() => {
      this.spinner.hide();
    })

  }

  private loadData() {
    this.spinner.show();
    this.restaurantService
      .getEmployee(this.employeeId)
      .subscribe(
        (response) => {
          console.log("employee data: ", response.data);
          if (response.status === 200) {
            this.currentUser = response.data.user[0];
            this.currentEmployee = response.data.employee[0];  
            this.currentJobTitle = this.jobTitles.find(
              (x) => x.id == response.data.employee[0].job_title
            ).name;         
          } else {
            Swal.fire(
              Swaldata.SwalErrorToast(
                this.translate.instant("Employee not found")
              )
            );
            this._router.navigate([
              "/owner/restaurants/employee/",
              this.restaurantId.toString(),
            ]);
          }
          this.spinner.hide();
        },
        (error) => {
          Swal.fire(
            Swaldata.SwalErrorToast(
              this.translate.instant("Employee not found")
            )
          );
        }
      )
      .add(() => {
        this.spinner.hide();
      });
  }

}
