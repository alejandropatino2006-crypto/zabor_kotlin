import { Component, OnInit, Input } from '@angular/core';
import { RestaurantService } from "../../../shared/services/restaurant.service";
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { environment } from "../../../../environments/environment";
import Swal from 'sweetalert2';
import * as Swaldata from './../../../shared/helpers/swalFunctionsData';
import { MapsAPILoader } from '@agm/core';
import { ClientStorageService } from '../../services/client-storage.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-restaurantview',
  templateUrl: './restaurantview.component.html',
  styles: ['agm-map { height: 400px; }', 'h5 { padding: 20px 0; }'],

})
export class RestaurantviewComponent implements OnInit {

  public restaurantId = -1;
  public restaurant: any;
  public res_time: any;
  public fileurl = environment.fileurl + "/";
  public lat: number;
  public lng: number;
  public zoom = 12;
  public showRestaurant = false;
  public resowner = -1;
  public ownerlist: Array<any> = [];
  public isAdmin = false;
  public claimedcheck = false;
  public editAllow: any = {
    pos: 1,
    menu: 1,
    reservation: 1,
    order: 1,
    Discount: 1
  }
  stripe_acc: string = null
  ath_acc: string = null
  ath_secret: string = null
  terminal_qty_max_limit: number = null

  isFive = false;
  isTen = false;
  isFifteen = false;

  // tslint:disable-next-line:max-line-length
  constructor(
    private mapsAPILoader: MapsAPILoader, private route: ActivatedRoute, private _router: Router, private restaurantService: RestaurantService, private spinner: NgxSpinnerService,
    private clientStorage: ClientStorageService
  ) {
  }

  ngOnInit() {
    //get restaurant id
    this.restaurantId = parseInt(this.route.snapshot.paramMap.get("id"));
    this.spinner.show();
    this.restaurantService.getrestaurantdetail(this.restaurantId).subscribe(
      data => {
        if (data.status) {
          this.showRestaurant = true;
          this.restaurant = data.data;
          this.res_time = data.openclose_time;
          this.lat = data.data.latitude;
          this.lng = data.data.longitude;
          this.resowner = data.data.created_by
          if (data.data.claimed == 1)
            this.claimedcheck = true

          this.editAllow = {
            pos: (data.data.can_edit_pos == 1) ? true : false,
            menu: (data.data.can_edit_menu == 1) ? true : false,
            reservation: (data.data.can_edit_reservation == 1) ? true : false,
            order: (data.data.can_edit_order == 1) ? true : false,
            Discount: (data.data.can_edit_discount == 1) ? true : false
          }

          this.stripe_acc = data.data.stripe_acc
          this.ath_acc = data.data.ath_acc
          this.ath_secret = data.data.ath_secret
          this.terminal_qty_max_limit = data.data.terminal_qty_max_limit
          console.log("stripe_fee", data.data.stripe_fee)
          switch (data.data.stripe_fee) {
            case 5:
              this.isFive = true
              break;
            case 10:
              this.isTen = true
              break;
            case 15:
              this.isFifteen = true
              break;

            default:
              break;
          }
        }
        else
          Swal.fire(Swaldata.SwalErrorToast(data.msg));
      },
      error => {
        Swal.fire(Swaldata.SwalErrorToast(error))
      }
    ).add(() => {
      this.spinner.hide();
    })

    if (localStorage.getItem('currentuser') && JSON.parse(localStorage.getItem('currentuser')).user && JSON.parse(localStorage.getItem('currentuser')).user.role == "admin")
      this.isAdmin = true
    //get owners list if loggedIn user is admin
    if (this.isAdmin) {
      this.spinner.show()
      this.restaurantService.getOwnerlist().subscribe(
        data => {
          if (data.status) {
            this.ownerlist = data.response;
            this.spinner.hide()
          }
        }
      )
    }
  }

  changeClaimStatus(e) {
    if (this.isAdmin)
      this.claimedcheck = e
  }

  changePosStatus(e) {

    this.editAllow.pos = (e == true) ? 1 : 0
  }

  changemenuStatus(e) {

    this.editAllow.menu = (e == true) ? 1 : 0
  }
  changeReservationStatus(e) {
    this.editAllow.reservation = (e == true) ? 1 : 0
  }
  changeOrderEditStatus(e) {
    this.editAllow.order = (e == true) ? 1 : 0
  }
  changediscountEditStatus(e) {
    this.editAllow.Discount = (e == true) ? 1 : 0
  }
  changeOwner() {

    Swal.fire(Swaldata.SwalConfirm("You want to change Restaurant owner")).then((result) => {
      if (result.value) {
        this.spinner.show();

        this.restaurantService.changeOwner(this.resowner, this.claimedcheck, this.restaurantId).subscribe(
          data => {
            if (data.status)
              Swal.fire(Swaldata.SwalSuccessToast(data.msg))
            else
              Swal.fire(Swaldata.SwalErrorToast(data.msg))
          },
          error => {
            Swal.fire(Swaldata.SwalErrorToast('Something went wrong!'));
          }
        ).add(() => {
          this.spinner.hide();
        })

      }
    })
  }

  changePermission() {

    Swal.fire(Swaldata.SwalConfirm("You want to change Restaurant owner permission")).then((result) => {
      if (result.value) {
        this.spinner.show();

        this.restaurantService.changeOwnerPermission(this.editAllow, this.restaurantId).subscribe(
          data => {
            if (data.status)
              Swal.fire(Swaldata.SwalSuccessToast(data.msg))
            else
              Swal.fire(Swaldata.SwalErrorToast(data.msg))
          },
          error => {
            Swal.fire(Swaldata.SwalErrorToast('Something went wrong!'));
          }
        ).add(() => {
          this.spinner.hide();
        })

      }
    })
  }

  SubmitStripe() {
    if (!this.stripe_acc || this.stripe_acc.trim() == "") {
      Swal.fire(Swaldata.SwalErrorToast('Please enter a valid stripe account'));
      return;
    }

    this.spinner.show()
    this.restaurantService.saveStripeAccount(this.restaurantId, this.stripe_acc).subscribe(data => {
      if (data.status)
        Swal.fire(Swaldata.SwalSuccessToast(data.msg))
      else
        Swal.fire(Swaldata.SwalErrorToast(data.msg))
    },
      err => {
        Swal.fire(Swaldata.SwalErrorToast(err))
      }
    ).add(() => {
      this.spinner.hide()
    })
  }

  SubmitAth() {
    if (!this.ath_acc || this.ath_acc.trim() == "" || !this.ath_secret || this.ath_secret.trim() == "") {
      Swal.fire(Swaldata.SwalErrorToast('Please enter a valid ATH account'));
      return;
    }
    // Validate terminal quantity
    if (!this.terminal_qty_max_limit) {
      Swal.fire(Swaldata.SwalErrorToast('Please enter a valid Terminal Quantity'));
      return;
    }

    this.spinner.show();

    // Send the data to the backend (including terminal_qty_max_limit)
    this.restaurantService.saveAthAccount(this.restaurantId, this.ath_acc, this.ath_secret).subscribe(data => {
      if (data.status)
        Swal.fire(Swaldata.SwalSuccessToast(data.msg))
      else
        Swal.fire(Swaldata.SwalErrorToast(data.msg))
    },
      err => {
        Swal.fire(Swaldata.SwalErrorToast(err))
      }
    ).add(() => {
      this.spinner.hide()
    })
  }

  changeStripeFee(event, value) {
    console.log("event: ", event, value)
    switch (value) {
      case 5:
        this.isFive = event
        break;
      case 10:
        this.isTen = event
        break;
      case 15:
        this.isFifteen = event
        break;

      default:
        break;
    }
  }

  submitFee() {
    console.log(this.isFive, this.isTen, this.isFifteen)
    if ((this.isFive && (this.isTen || this.isFifteen)) || (this.isTen && (this.isFive || this.isFifteen)) || (this.isFifteen && (this.isFive || this.isTen)) || (!this.isFive && !this.isTen && !this.isFifteen)) {
      Swal.fire(Swaldata.SwalErrorToast("Please select only one option"))
    } else {
      let fee = 5
      if (this.isFive) {
        fee = 5
      } else if (this.isTen) {
        fee = 10
      } else if (this.isFifteen) {
        fee = 15
      }
      console.log("fee: ", fee)
      this.spinner.show()
      this.restaurantService.saveStripeFee(this.restaurantId, fee).subscribe(data => {
        if (data.status)
          Swal.fire(Swaldata.SwalSuccessToast(data.msg))
        else
          Swal.fire(Swaldata.SwalErrorToast(data.msg))
      },
        err => {
          Swal.fire(Swaldata.SwalErrorToast(err))
        }
      ).add(() => {
        this.spinner.hide()
      })
    }
  }

  handleBackClicked(evt: MouseEvent) {
    evt.preventDefault();
    const loggedInArea = this.clientStorage.retrieveCurrentLoggedInArea();
    if (loggedInArea === 'admin') {
      this._router.navigate(['admin', 'restaurant', 'list']);
    }
    if (loggedInArea === 'owner') {
      this._router.navigate(['owner', 'restaurants', 'list']);
    }
  }

  SubmitTerminalQtyMaxLimit() {
    // Validate terminal quantity
    if (!this.terminal_qty_max_limit) {
      Swal.fire(Swaldata.SwalErrorToast('Please enter a valid Terminal Quantity'));
      return;
    }

    this.spinner.show();

    // Send the data to the backend (including terminal_qty_max_limit)
    this.restaurantService.saveTerminalQtyMaxLimit(this.restaurantId, this.terminal_qty_max_limit).subscribe(data => {
        if (data.status)
          Swal.fire(Swaldata.SwalSuccessToast(data.msg))
        else
          Swal.fire(Swaldata.SwalErrorToast(data.msg))
      },
      err => {
        Swal.fire(Swaldata.SwalErrorToast(err))
      }
    ).add(() => {
      this.spinner.hide()
    })
  }

}
