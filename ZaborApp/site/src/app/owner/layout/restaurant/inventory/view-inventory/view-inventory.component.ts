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

@Component({
  selector: 'app-view-inventory',
  templateUrl: './view-inventory.component.html',
  styleUrls: ['./view-inventory.component.scss']
})
export class ViewInventoryComponent implements OnInit {
  restaurantId: number;
  inventoryId: number;
  currentInventory: any;
  inventoryGroups: any = [];
  inventoryLocations: any = [];
  inventoryVendors: any = [];
  vendorName: string = "";
  groupName: string = "";
  locationName: string = "";

  constructor(
    private _router: Router,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private restaurantService: RestaurantService,
    private route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.getInventoryDetails();
    this.restaurantId = parseInt(this.route.snapshot.paramMap.get("restid"));
    this.inventoryId = parseInt(this.route.snapshot.paramMap.get("id"));
    this.loadData();
  }

  getInventoryDetails() {
    console.log("get inventory details", this.inventoryGroups);
    this.spinner.show();
    this.restaurantService
      .getInventoryDetails()
      .subscribe(
        (data) => {
          console.log(
            "returned inventory details data: ",
            data,
            this.inventoryGroups
          );
          if (data.status) {
            console.log("returned inventory details: ", data);
            this.inventoryGroups = data.inventory_group;
            this.inventoryLocations = data.inventory_location;
            this.inventoryVendors = data.inventory_vendor;
            console.log("inventory groups: ", this.inventoryGroups);
          } else Swal.fire(Swaldata.SwalErrorToast(data.msg));
        },
        (error) => {
          Swal.fire(
            Swaldata.SwalErrorToast(
              this.translate.instant("Something went wrong")
            )
          );
          this._router.navigate(["/owner/restaurants"]);
        }
      )
      .add(() => {
        this.spinner.hide();
      });
  }

  private loadData() {
    this.restaurantService
      .getInventory(this.inventoryId)
      .subscribe(
        (data) => {
          console.log("inventory data: ", data);
          if (data.status === 200) {
            this.currentInventory = data.data[0];   
            this.vendorName = this.inventoryVendors.find(
              (x) => x.id == this.currentInventory.inventory_vendor
            ).name; 
            this.groupName = this.inventoryGroups.find(
              (x) => x.id == this.currentInventory.inventory_group
            ).name;
            this.locationName = this.inventoryLocations.find(
              (x) => x.id == this.currentInventory.inventory_location
            ).name;
          } else {
            Swal.fire(
              Swaldata.SwalErrorToast(
                this.translate.instant("Inventory not found")
              )
            );
            this._router.navigate([
              "/owner/restaurants/inventory/",
              this.restaurantId.toString(),
            ]);
          }
        },
        (error) => {
          Swal.fire(
            Swaldata.SwalErrorToast(
              this.translate.instant("Inventory not found")
            )
          );
        }
      )
      .add(() => {
        this.spinner.hide();
      });
  }

}
