import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { TranslateService } from "@ngx-translate/core";
import { NgxSpinnerService } from "ngx-spinner";
import { RestaurantService } from "src/app/shared/services/restaurant.service";
import Swal from "sweetalert2";
import * as Swaldata from "../../../../../shared/helpers/swalFunctionsData";

@Component({
  selector: 'app-view-customer',
  templateUrl: './view-customer.component.html',
  styleUrls: ['./view-customer.component.scss']
})
export class ViewCustomerComponent implements OnInit {

  restaurantId: number;
  loggedInUser_Id = localStorage.getItem("currentUserId");
  customerId: number;
  currentUser: any;
  currentCustomer: any;
  currentAddress: any;
  customerOrders: any[] = [];

  constructor(
    private _router: Router,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private restaurantService: RestaurantService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.restaurantId = parseInt(this.route.snapshot.paramMap.get("restid"), 10);
    this.customerId = parseInt(this.route.snapshot.paramMap.get("id"), 10);
    this.loadData();
  }

  private loadData() {
    this.spinner.show();

    this.restaurantService.getCustomer(this.customerId).subscribe(
      (response) => {
        console.log("customer data: ", response.data);

        if (response.status && response.data?.customer) {
          this.currentCustomer = response.data.customer;
          this.currentAddress = response.data.address || {};
          this.customerOrders = response.data.orders || []; // 👈 extract orders

        } else {
          Swal.fire(
            Swaldata.SwalErrorToast(
              this.translate.instant(response.msg || "Customer not found")
            )
          );
          this._router.navigate([
            "/owner/restaurants/customer/",
            this.restaurantId.toString(),
          ]);
        }
      },
      (error) => {
        console.error("Error loading customer:", error);
        Swal.fire(
          Swaldata.SwalErrorToast(
            this.translate.instant("There was an error loading customer details.")
          )
        );
        this._router.navigate([
          "/owner/restaurants/customer/",
          this.restaurantId.toString(),
        ]);
      }
    ).add(() => {
      this.spinner.hide();
    });
  }

}
