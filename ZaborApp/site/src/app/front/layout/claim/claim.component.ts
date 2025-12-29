import { Component, OnInit } from '@angular/core';
import { RestaurantService } from '../../../shared/services/frontServices/restaurant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../shared/helpers/swalFunctionsData';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Icu } from '@angular/compiler/src/i18n/i18n_ast';

@Component({
  selector: 'app-claim',
  templateUrl: './claim.component.html'
})
export class ClaimComponent implements OnInit {

  public res_id: number
  askforclaim: boolean = true
  public allowClaim: boolean = false
  public user: any

  public claimForm: FormGroup

  constructor(private _router: Router, private _fb: FormBuilder, private spinner: NgxSpinnerService, private restaurantservice: RestaurantService, private route: ActivatedRoute, ) { }

  ngOnInit() {

    this.claimForm = this._fb.group({
      email: ['', [Validators.required, Validators.email]]
    })

    if (localStorage.getItem('currentuser')) {
      let user = JSON.parse(localStorage.getItem('currentuser')).user
      if (user) {
        this.claimForm.patchValue({
          email: user.email
        })
      }
    }
    this.res_id = parseInt(this.route.snapshot.paramMap.get("id"));
    this.Checkclaim()
  }

  Checkclaim() {
    this.spinner.show()
    this.restaurantservice.getRestaurantdetail(this.res_id).subscribe(
      data => {
        if (data.status && data.data && data.data.restaurantDetail.length > 0) {
          if (data.data.restaurantDetail[0].claimed == 0) {
            this.allowClaim = true
          } else {
            Swal.fire(Swaldata.SwalErrorToast('You can not claim this Restaurant'))
          }

        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.msg))
        }

      },
      err => {
        Swal.fire(Swaldata.SwalErrorToast('something went wrong'))
      }
    ).add(() => {
      this.spinner.hide()
    })
  }

  claim() {
    this.askforclaim = false
  }

  onSubmit() {
    if (!this.claimForm.valid)
      return

    this.spinner.show()
    this.restaurantservice.claimRes(this.claimForm.value.email, this.res_id).subscribe(
      data => {
        if (data.status) {
          Swal.fire(Swaldata.SwalSuccessToast(data.msg))
        } else {
          Swal.fire(Swaldata.SwalErrorToast('Something went wrong'))
        }
      },
      err => {
        Swal.fire(Swaldata.SwalErrorToast(err))
      }
    ).add(() => {
      this.spinner.hide();
      this._router.navigate(['/']);
    })
  }
}
