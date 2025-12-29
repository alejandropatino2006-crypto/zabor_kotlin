import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { RestaurantService } from './../../../../shared/services/restaurant.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NgxSpinnerService } from "ngx-spinner";
import { environment } from "../../../../../environments/environment";
import Swal from 'sweetalert2';
import { SwalErrorToast, SwalConfirm, SwalSuccessToast } from 'src/app/shared/helpers/swalFunctionsData';
import { TranslatePipe } from '@ngx-translate/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-review',
  templateUrl: './review.component.html',
  styleUrls: ['./review.component.scss']
})
export class ReviewComponent implements OnInit {
  @ViewChild('search') search: ElementRef;
  @ViewChild('sortby') sortby: ElementRef;

  public restaurantId: number = -1;
  public userReviews: Array<any> = [];
  public picurl: string = environment.fileurl + '/';
  public searchvalue: string = "";
  public sortbyvalue: number = -1;
  public page: number = 1;
  public showMoreButton = true;

  public reviewsatatus: any

  constructor(private spinner: NgxSpinnerService, private restaurantservice: RestaurantService, private route: ActivatedRoute, private _router: Router, private translate: TranslateService) { }


  ngOnInit() {
    //get restaurant id
    this.restaurantId = parseInt(this.route.snapshot.paramMap.get("id"));
    this.spinner.show();
    this.restaurantservice.getreviewstatus(this.restaurantId).subscribe(
      data => {

        this.reviewsatatus = {
          avgrating: parseFloat(data.response[0][0].avgrating).toFixed(1),
          totaluser: parseInt(data.response[0][0].totaluser),
          onestar: parseInt(data.response[1][0].oneratingcount),
          twostar: parseInt(data.response[2][0].tworatingcount),
          threestar: parseInt(data.response[3][0].threeratingcount),
          fourstar: parseInt(data.response[4][0].fourratingcount),
          fivestar: parseInt(data.response[5][0].fiveratingcount)
        }
        this.getReviews();
      },
      error => {

      }
    ).add(() => {
      this.spinner.hide();
    })

  }

  searchReview() {
    this.searchvalue = this.search.nativeElement.value;
    this.sortbyvalue = this.sortby.nativeElement.value;
    this.userReviews = [];
    this.showMoreButton = true;
    this.page = 1;
    this.getReviews();
  }

  reset() {
    this.search.nativeElement.value = "";
    this.sortby.nativeElement.value = -1;
    this.searchvalue = "";
    this.sortbyvalue = -1;
    this.showMoreButton = true;
    this.page = 1;
  }
  getReviews() {
    this.spinner.show();
    let data = {
      res_id: this.restaurantId,
      search: this.searchvalue,
      sortby: this.sortbyvalue,
      page: this.page
    }
    this.restaurantservice.getReview(data).subscribe(
      response => {
        if (response.status) {
          if (response.response.length > 0) {
            response.response.map((item) => {
              this.userReviews.push(item);
            })
            if (response.response.length < 10)
              this.showMoreButton = false;
          } else {
            this.showMoreButton = false;
          }
        }
      },
      error => {
        Swal.fire(SwalErrorToast(error))
      }
    ).add(() => {
      this.spinner.hide();
    })
  }

  moreReview() {
    this.page += 1;
    this.getReviews();
  }

  delete(review_id) {
    Swal.fire(SwalConfirm(this.translate.instant("Are you sure want to delete review? "))).then(result => {
      if (result.value && review_id > 0) {
        this.spinner.show();
        this.restaurantservice.deletereview(review_id).subscribe(
          data => {
            if (data.status) {
              Swal.fire(SwalSuccessToast(data.msg));
              this.userReviews.map((item, index) => {
                if (item.id == review_id) {
                  this.userReviews.splice(index, 1);
                }
              });
            } else {
              Swal.fire(SwalErrorToast(data.msg));
            }
          },
          error => {
            Swal.fire(SwalErrorToast(error));
          }
        ).add(() => {
          this.spinner.hide();
        })
      }
    })
  }

  handleBackClicked(evt: MouseEvent) {
    evt.preventDefault();
    this._router.navigate(['owner', 'restaurants', 'list']);
  }
}
