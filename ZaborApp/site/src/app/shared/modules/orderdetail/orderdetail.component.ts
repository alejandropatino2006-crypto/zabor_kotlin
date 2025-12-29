import {Component, OnInit, ViewChild, ElementRef, OnDestroy} from '@angular/core';
import { RestaurantService } from "../../../shared/services/restaurant.service";
import { NgxSpinnerService } from "ngx-spinner";
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import { Subject, interval } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DataTableDirective } from 'angular-datatables';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../shared/helpers/swalFunctionsData';
import { TranslatePipe } from '@ngx-translate/core';


@Component({
  selector: 'app-orderdetail',
  templateUrl: './orderdetail.component.html',
  styles: ['span{color:#292929}', '.cus-p{padding:0px}', '.total-bottom td{border:none}', 'select.ng-valid{border:1px solid #ced4da;}', 'tr td:last-child, thead th:last-child{text-align:right}', '.cus-tr{width:50% !important}', 'p{margin-bottom: 10px;}', 'thead th{border:none;    padding: 15px 0px;}', 'h4{font-family: sans-serif;}', '.driverTable td{ width: 50%;  }']
})
export class OrderdetailComponent implements OnInit, OnDestroy {
  orderId: number
  orderDetail: any = []
  formatedCreatedDate: any;
  Orderitems: any;
  orderStatus: string;
  showChangeStatus: boolean = false;

  trans_id: string = '';
  cardLast4: string = '';
  paymentError: string = ''

  isAdmin: boolean = false;
  driverAssigned: boolean = false;
  driverDetail: any = {}
  fileUrl: string = environment.fileurl + '/';
  Code: Number;
  cookingTime: Number = 0
  user_code_verified: boolean = false;
  payment_checkbox: boolean = false;

  AllOrderStatus = ['received', 'preparing', 'ready', 'pickup', 'delivered', 'cancelled']
  orderissue: string = ''
  // delivery_mode   1 = home delivery; 2 = pick up
  // payment_mode   1 = stripe Online; 2 = Cash on delivery; 3: Authorize net

  @ViewChild('invoice') invoice: ElementRef;
  @ViewChild('paymentStatusDiv') paymentStatusDiv: ElementRef
  mySubscription: any;
  @ViewChild('orderProgressbar') orderProgressbar: any
  restaurantUrl: string;

  constructor(private http: HttpClient, private route: ActivatedRoute, private _router: Router, private restaurantService: RestaurantService, private spinner: NgxSpinnerService) {
    //get restaurant id
    this.orderId = parseInt(this.route.snapshot.paramMap.get("id"));
  }

  ngOnInit() {
    if (window.location.href.indexOf('admin') > -1)
      this.isAdmin = true
    //get currentuser detail
    if (JSON.parse(localStorage.getItem('currentuser')) && JSON.parse(localStorage.getItem('currentuser')).user.role == 'owner') {
      this.showChangeStatus = true
    }

    //get order detail
    this.spinner.show()
    this.restaurantService.getOrderDetail(this.orderId).subscribe(
      data => {
        if (data.status) {
          console.log(data)
          if (data.data.code_verified == 1)
            this.user_code_verified = true

          this.AllOrderStatus.splice(0, this.AllOrderStatus.indexOf(data.data.status))

          this.orderDetail = data.data
          this.cookingTime = data.data.cooking_time
          let tempDate = new Date(data.data.created_date)
          this.formatedCreatedDate = tempDate.getFullYear() + "-" + (tempDate.getMonth() + 1) + "-" + tempDate.getDate() + " " + tempDate.getHours() + ":" + tempDate.getMinutes() + ":" + tempDate.getSeconds()
          this.Orderitems = JSON.parse(data.data.cart);
          this.orderStatus = data.data.status;
          if (this.orderStatus == 'delivered') {
            this.AllOrderStatus = ['delivered']
          }
          this.orderissue = data.data.orderissue

          if (this.orderDetail.payment_mode == 1) {
            if (JSON.parse(this.orderDetail.payment_data) && JSON.parse(this.orderDetail.payment_data).id) {
              this.cardLast4 = '**** **** ****' + JSON.parse(this.orderDetail.payment_data).payment_method_details.card.last4;
              this.trans_id = JSON.parse(this.orderDetail.payment_data).id;
            } else {
              this.paymentError = JSON.parse(this.orderDetail.payment_data).raw.message;
            }
          }

          if (this.orderDetail.payment_mode == 3) {
            if (JSON.parse(this.orderDetail.payment_data) && JSON.parse(this.orderDetail.payment_data).transId) {
              this.cardLast4 = JSON.parse(this.orderDetail.payment_data).accountNumber;
              this.trans_id = JSON.parse(this.orderDetail.payment_data).transId;
            }
          }

          if (window.location.href.indexOf("owner") > -1) {
            this.restaurantUrl = `/owner/restaurants/detail/${this.orderDetail.res_id}`
          }

          if (window.location.href.indexOf("admin") > -1) {
            this.restaurantUrl = `/admin/restaurant/view/${this.orderDetail.res_id}`
          }

        } else {
          Swal.fire(Swaldata.SwalErrorToast('you are not authorise to access this order'))
        }
      },
      err => {
        Swal.fire(Swaldata.SwalErrorToast(err))
      }
    ).add(() => {
      this.spinner.hide()
    })

    this.checkDriver();
    this.pollForDriver();
  }




  subCookingTime() {
    this.spinner.show()
    this.restaurantService.updateCookingTime(this.orderId, this.cookingTime).subscribe(
      data => {
        if (data.status) {
          // Swal.fire(Swaldata.SwalSuccessToast(data.msg))
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

  verify_userCode(e) {
    if (e && !isNaN(e) && e.length < 6) {
      Swal.fire(Swaldata.SwalErrorToast('Verification Code is invalid'));
      return;
    }

    this.spinner.show()
    this.restaurantService.verifyUserCode(e, this.orderId).subscribe(data => {
      if (data.status) {
        Swal.fire(Swaldata.SwalSuccessToast('Code is successfully Verified'))
        this.user_code_verified = true
      } else {
        Swal.fire(Swaldata.SwalErrorToast('Code is incorrect'))
      }
    }).add(() => {
      this.spinner.hide()
    })
  }

  //get assigned driver
  checkDriver() {
    if (this.driverAssigned) {
      this.unpollForDriver();
    } else {
      this.restaurantService.getDriverForOrder(this.orderId).subscribe(
        data => {
          if (data.status) {
            this.driverAssigned = true;
            this.unpollForDriver();
            this.driverDetail = data.data
          }
        },
        error => {
          if (error.status === 401) {
            Swal.fire(Swaldata.SwalErrorToast('You are not logged in'));
          } else {
            Swal.fire(Swaldata.SwalErrorToast('Something went wrong'));
          }
        }
      ).add(() => {

      })
    }
  }

  changeStatus() {
    if (this.orderDetail.status == this.orderStatus) {
      Swal.fire(Swaldata.SwalErrorToast('Order status already updated'));
      return;
    }

    let data = { loggedInUser_Id: localStorage.getItem('currentUserId'), orderstatus: this.orderStatus, orderId: this.orderId }

    if (this.orderStatus == 'preparing') {
      if (this.cookingTime < 1) {
        Swal.fire(Swaldata.SwalErrorToast('Please enter valid cooking time'));
        return;
      } else
        this.subCookingTime()
    }

    if (this.orderStatus == 'delivered') {
      if (this.orderDetail.payment_status != 1) {
        this.paymentStatusDiv.nativeElement.style.border = '2px solid red';
        Swal.fire(Swaldata.SwalErrorToast('order Payment is not completed'))
        return;
      }
    }
    if (this.orderStatus == 'delivered' && this.orderissue && this.orderissue.trim() != '')
      data['issue'] = this.orderissue


    if (this.orderStatus == 'cancelled') {
      if (this.orderissue.trim() == '') {
        Swal.fire(Swaldata.SwalErrorToast('Please enter cancel reason'));
        return;
      } else
        data['issue'] = this.orderissue
    }

    this.spinner.show()
    this.restaurantService.changeOrderStatus(data).subscribe(
      response => {
        if (response.status) {
          this.orderDetail.status = this.orderStatus
          Swal.fire(Swaldata.SwalSuccessToast(response.msg))
          this.AllOrderStatus.splice(0, this.AllOrderStatus.indexOf(this.orderStatus))
          if (this.orderStatus == 'delivered') {
            this.AllOrderStatus = ['delivered']
          }
          this.orderProgressbar.getorderstatusProgress()
        } else {
          Swal.fire(Swaldata.SwalErrorToast(response.msg))
        }
      },
      err => {
        Swal.fire(Swaldata.SwalErrorToast(err))
      }
    ).add(() => {
      this.spinner.hide()
    })
  }

  confirmCode() {
    if (this.Code) {
      this.spinner.show()
      this.restaurantService.verifyCode(this.Code, this.orderId).subscribe(
        data => {
          if (data.status) {
            Swal.fire(Swaldata.SwalSuccessToast(data.msg))
            this.driverDetail.code_verify = 1;
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
    } else {
      Swal.fire(Swaldata.SwalErrorToast('Please enter a valid Code'))
    }
  }

  payment_complete() {
    if (!this.payment_checkbox)
      return

    this.paymentStatusDiv.nativeElement.style.border = 'none';
    Swal.fire(Swaldata.SwalConfirm("Payment status for this order will be complete")).then((result) => {
      if (result.value) {
        this.spinner.show()
        this.restaurantService.updatePaymentStatus(this.orderId).subscribe(
          data => {
            if (data.status) {
              Swal.fire(Swaldata.SwalSuccessToast(data.msg))
              this.orderDetail.payment_status = 1;

            } else {
              Swal.fire(Swaldata.SwalErrorToast(data.msg))
            }
          },
          err => {

          }
        ).add(() => {

          this.spinner.hide()
        })
      }
    })


  }

  stopSearching() {
    //stop searching for driver , restaurant owner will deliver order
    Swal.fire(Swaldata.SwalConfirm("Restaurant owner will have to deliver this order")).then((result) => {
      if (result.value) {
        this.restaurantService.stopSearching(this.orderId).subscribe(
          data => {
            if (data.status) {
              Swal.fire(Swaldata.SwalSuccessToast(data.msg))
              this.orderDetail.delivered_by = "owner"
            } else {
              Swal.fire(Swaldata.SwalErrorToast(data.msg))
            }
          }
        )
      }
    })
  }

  pollForDriver() {
    if (this.mySubscription == null) {
      this.mySubscription = interval(90000).subscribe(x => {
        this.checkDriver();
      });
    }
  }

  unpollForDriver() {
    if (this.mySubscription != null) {
      this.mySubscription.unsubscribe();
      this.mySubscription = null;
    }
  }

  ngOnDestroy(): void {
    this.unpollForDriver();
  }

}
