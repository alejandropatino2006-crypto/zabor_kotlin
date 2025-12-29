import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestaurantService } from 'src/app/shared/services/restaurant.service';
import Swal from 'sweetalert2';
import { noOnlyWhitespaceValidator } from "../../../../../shared/helpers/custom.validator";
import * as Swaldata from '../../../../../shared/helpers/swalFunctionsData';

@Component({
  selector: 'app-create-inventory',
  templateUrl: './create-inventory.component.html',
  styleUrls: ['./create-inventory.component.scss']
})
export class CreateInventoryComponent implements OnInit {

  inventoryForm: FormGroup;
  inventoryGroups: any = [];
  inventoryLocations: any = [];
  inventoryVendors: any = [];
  restaurantId: number;

  constructor(
    private _router: Router, 
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private translate: TranslateService,
    private restaurantService: RestaurantService,
    private route: ActivatedRoute,
  ) { }

  ngOnInit() {
    this.getInventoryDetails();
    this.inventoryForm = this.formBuilder.group({
      name: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(60)]],
      pack_size_description: ["", [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(200)]],
      pack_size_barcode: ["", [Validators.maxLength(200)]],
      each_item_barcode: ["", [Validators.maxLength(200)]],
      total_items_per_pack_size: ["", [Validators.required, Validators.maxLength(10)]],
      recipe_units_per_pack_size: ["", [Validators.required,  Validators.maxLength(10)]],
      inventory_group: ["", [Validators.required,  Validators.maxLength(10)]],
      inventory_location: ["", [Validators.required,  Validators.maxLength(10)]],
      inventory_vendor: ["", [Validators.required,  Validators.maxLength(10)]],
      sort_order: ["", [Validators.required,  Validators.maxLength(10)]],
      pack_size_reorder_point: ["", [Validators.required,  Validators.maxLength(10)]],
      pack_size_replenish_level: ["", [Validators.required,  Validators.maxLength(10)]],
      inventory_description: ["", [Validators.required,  Validators.maxLength(200)]],
      pack_size_quantity_on_hand: ["", [Validators.required,  Validators.maxLength(10)]],
      pack_size_cost_per_qty: ["", [Validators.required,  Validators.maxLength(10)]],
      total_pack_size_value: ["", [Validators.required,  Validators.maxLength(10)]]
    });
    this.restaurantId = parseInt(this.route.snapshot.paramMap.get("restid"));
  }

  getInventoryDetails() {  
    console.log("get inventory details", this.inventoryGroups);  
    this.spinner.show();
    this.restaurantService.getInventoryDetails().subscribe(data => {
      console.log("returned inventory details data: ", data, this.inventoryGroups);
      if (data.status) {
        console.log("returned inventory details: ", data);
        this.inventoryGroups = data.inventory_group;
        this.inventoryLocations = data.inventory_location;
        this.inventoryVendors = data.inventory_vendor;
        console.log("inventory groups: ", this.inventoryGroups);
      }
      else
        Swal.fire(Swaldata.SwalErrorToast(data.msg));
    }, error => {
      Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
      this._router.navigate(['/owner/restaurants']);
    }).add(() => {
      this.spinner.hide();
    })

  }

  onSubmit() {    
    console.log(this.inventoryForm)
    if (this.inventoryForm.invalid) {
      console.log(this.inventoryForm)
      return;
    }

    // cleanForm(this.restaurantForm);

    
    this.spinner.show();

    var formData = new FormData();
    Object.entries(this.inventoryForm.value).forEach(
      ([key, value]: any[]) => {
        formData.set(key, value);
      }
    )

    formData.set('last_update_date', new Date().toISOString().slice(0, 19).replace('T', ' '));
    formData.set('restid', this.restaurantId.toString());
    

    this.restaurantService.createInventory(formData).subscribe(
      data => {        
        if (data.status) {
          Swal.fire(Swaldata.SwalSuccessToast(data.msg));
        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.msg));
        }
        this._router.navigate(['/owner/restaurants/inventory/', this.restaurantId.toString()]);
      },
      error => {
        Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Not Able to create Inventory")));
      }
    ).add(() => {
      this.spinner.hide();
    });
  }

}
