import { Component, OnInit } from '@angular/core';
import { RestaurantService } from '../../../../shared/services/restaurant.service';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../../shared/helpers/swalFunctionsData';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-sales-dashboard',
  templateUrl: './sales-dashboard.component.html',
  styleUrls: ['./sales-dashboard.component.scss']
})
export class SalesDashboardComponent implements OnInit {

  reportsList: {
    menuitem_recordsTotal: number; menu_recordsTotal: number; delivery_recordsTotal: number; shifts_recordsTotal: number; employee_recordsTotal: number; payout_recordsTotal: number; refund_recordsTotal: number;
  } = {
    menuitem_recordsTotal: -1,
    menu_recordsTotal: -1,
    delivery_recordsTotal: -1,
    shifts_recordsTotal: -1,
    employee_recordsTotal: -1,
    payout_recordsTotal: -1,
    refund_recordsTotal: -1
  };

  constructor(
    private restaurantService: RestaurantService,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.restaurantService.getReportslist()
    .subscribe(
      (response) => {
        if (response.status) {
          const responseData = response.data;
          // responseData.map(data => {
          //   this.restaurantList.push(data);
          // });
          console.log("reportsList: ", responseData);
          this.reportsList = responseData;
          //this.resId = this.restaurantList[0].id;
        } else {
          Swal.fire(Swaldata.SwalErrorToast(this.translate.instant("Something went wrong")));
        }
      },
      (error) => {
        Swal.fire(Swaldata.SwalErrorToast("Restaurant List didnt come"));
      }
    )
    .add(() => {
      // this.spinner.hide();
      // this.getOrders();
    });
  }

}
