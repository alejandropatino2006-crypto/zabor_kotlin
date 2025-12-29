import { Component, OnInit } from '@angular/core';
import { RestaurantService } from "../../../shared/services/restaurant.service";
import { NgxSpinnerService } from "ngx-spinner";
import { Router, ActivatedRoute } from '@angular/router';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../shared/helpers/swalFunctionsData';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-reservationdetail',
  templateUrl: './reservationdetail.component.html'
})
export class ReservationdetailComponent implements OnInit {

  reservationId: number = -1;
  reservationDetail: any = [];
  cardDetail: any;
  formatedCreatedDate: string;
  stripeId: string;
  isAdmin: boolean = false;


  constructor(private route: ActivatedRoute, private _router: Router, private restaurantService: RestaurantService, private spinner: NgxSpinnerService) { }

  ngOnInit() {
    if (window.location.href.indexOf('admin') > -1)
      this.isAdmin = true
    this.reservationId = parseInt(this.route.snapshot.paramMap.get("id"));
    this.getReservationDetail()
  }

  getReservationDetail() {
    this.spinner.show()
    this.restaurantService.getReservationDetail(this.reservationId).subscribe(
      data => {
        if (data.status) {
          this.reservationDetail = data.data
          this.cardDetail = JSON.parse(this.reservationDetail.paymentdata).payment_method_details.card.last4;
          this.stripeId = JSON.parse(this.reservationDetail.paymentdata).id;
        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.msg))
        }
      },
      err => {
        Swal.fire(Swaldata.SwalErrorToast(err))
      }
    ).add(() => {
      this.spinner.hide()
    })
  }

  formatedDate(date) {
    let tempDate = new Date(date)
    return tempDate.getFullYear() + "-" + (tempDate.getMonth() + 1) + "-" + tempDate.getDate()
  }

}
