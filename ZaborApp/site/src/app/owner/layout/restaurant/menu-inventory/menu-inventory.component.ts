import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RestaurantService } from 'src/app/shared/services/restaurant.service';
import * as Swaldata from "src/app/shared/helpers/swalFunctionsData";
import Swal from 'sweetalert2';
import { TranslateService } from "@ngx-translate/core";
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-menu-inventory',
  templateUrl: './menu-inventory.component.html',
  styleUrls: ['./menu-inventory.component.scss']
})
export class MenuInventoryComponent implements OnInit, OnChanges {

  @Input() item_id: number;
  @Input() item_name:string;
  @Input() restid: number;
  inventoryForm:FormGroup;
  inventoryFormvalue: any = null;
  inventoryList: any = [];
  inventoryListForItem: any = [];
  totalCostForItem: number = 0;
  availableQty: number = 0;
  constructor(
    private restaurantService: RestaurantService,
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private spinner: NgxSpinnerService
  ) { }

  ngOnInit() {
    console.log("item_id inside component", this.item_id);
    this.inventoryForm = this.formBuilder.group({
      inventoryitem: ["", [Validators.required]],
      inventory_qty: ["", [Validators.required]]
    });
    this.getInventoryListForItem(this.item_id);
    this.getInventoryList();
  }

  ngOnChanges() {
    this.getInventoryListForItem(this.item_id);
  }

  selectInventory(eventTarget: EventTarget) {
    const id = (eventTarget as HTMLSelectElement).value;
    console.log("currentItem", id);
    let currentItem = this.inventoryList.find(item => item.id == id);
    this.availableQty = currentItem.pack_size_quantity_on_hand;
  }

  getInventoryList() {
    this.restaurantService.getInventoryList(this.restid).subscribe(
      (data) => {
        console.log("inventoryList data", data);
        if (data.status) {
          this.inventoryList = data.data;
        } else {
          Swal.fire(Swaldata.SwalWarnToast(data.msg));
        }
      },
      (error) => {
        console.log("getInventoryList - error", error);
        Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
      }
    )
  }

  getInventoryListForItem(itemId: number) {
    if (itemId < 1) return;
    this.inventoryListForItem = [];
    this.totalCostForItem = 0;
    this.restaurantService.getInventoryListForItem(itemId).subscribe(
      (response) => {
        console.log("inventoryListForItem data", response);
        if (response.status == 200) {
          this.inventoryListForItem = response.data;
          for (let i = 0; i < this.inventoryListForItem.length; i++) {
            this.totalCostForItem += this.inventoryListForItem[i].subtotal;
          }
        } else {
          Swal.fire(Swaldata.SwalErrorToast(response.msg));
        }
      }
    )
  }

  onSubmit() {
    console.log("inventoryForm", this.inventoryForm);
    this.inventoryFormvalue = this.inventoryForm.value;
    this.inventoryFormvalue.menugroupitem = this.item_id;
    this.spinner.show();
    this.restaurantService.addInventory(this.inventoryFormvalue).subscribe(
      (data) => {
        if (data.status) {
          Swal.fire(Swaldata.SwalSuccessToast(data.msg));
          this.getInventoryListForItem(this.item_id);
          this.spinner.hide();
        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.msg));
        }
      }
    )
  }

  deleteInventory(event, inventoryId) {
    event.preventDefault();
    Swal.fire(Swaldata.SwalConfirm(this.translate.instant("Are you sure you want to delete this inventory item from list?"))).then((result) => {
      if (result.value) {
        console.log(result.value, inventoryId)
        if (result.value) {
          this.spinner.show();
          this.restaurantService.deleteInventoryItem(inventoryId).subscribe(
            data => {
              if (data.status) {
                this.getInventoryListForItem(this.item_id);
                Swal.fire(Swaldata.SwalSuccessToast(this.translate.instant('Inventory item deleted succefully')));
              }
              else {
                Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Problem deleting Inventory item!')));
              }
            },
            error => {
              Swal.fire(Swaldata.SwalErrorToast(this.translate.instant('Problem deleting Inventory item!')));
            }
          ).add(() => {
            this.spinner.hide();
          })
        }
      }
    })
  }

}
