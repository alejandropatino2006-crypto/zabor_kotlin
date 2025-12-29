import { Component, OnInit } from '@angular/core';
import { RestaurantService } from '../../../shared/services/frontServices/restaurant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../shared/helpers/swalFunctionsData';
import { environment } from "../../../../environments/environment";


@Component({
  selector: 'app-offers2',
  templateUrl: './offers.component.html',
  styles: ['.res-div img{width: 150px;     border-radius: 5px; cursor: pointer;}'],
})
export class OffersComponent implements OnInit {
  discounts: Array<any> = []
  constructor(private restaurantservice: RestaurantService, private spinner: NgxSpinnerService) { }
  fileurl: string = environment.fileurl + '/';

  ngOnInit() {

    //get offers nearest
    this.spinner.show()
    this.restaurantservice.getofferwithinlocation().subscribe(
      data => {
        if (data.status) {
          let discounts = []
          data.data.forEach(element => {
            let found = false;
            discounts.forEach(e => {
              if (e.res_id == element.res_id)
                found = true
            })
            if (!found)
              discounts.push({ res_id: element.res_id, res_name: element.name, pic: element.restaurantpic, discounts: [] })
          });
          data.data.forEach(element => {
            discounts.forEach((e, i) => {
              if (e.res_id == element.res_id)
                discounts[i].discounts.push(element)
            });
          });
          this.discounts = discounts
        } else
          this.discounts = []
      },
      err => {
        Swal.fire(Swaldata.SwalErrorToast(err))
      }
    ).add(() => {
      this.spinner.hide()
    })
  }

}
