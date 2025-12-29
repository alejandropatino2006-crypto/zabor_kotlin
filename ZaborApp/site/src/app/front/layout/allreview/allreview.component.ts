import { Component, OnInit } from '@angular/core';
import { RestaurantService } from '../../../shared/services/frontServices/restaurant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../shared/helpers/swalFunctionsData';
import { ActivatedRoute } from '@angular/router';
import { environment } from "../../../../environments/environment";
declare var $: any;

@Component({
  selector: 'app-allreview',
  templateUrl: './allreview.component.html',
  styleUrls: ['./allreview.component.scss'],
})
export class AllreviewComponent implements OnInit {

  page = 1;
  direction: string = '';
  res_id = -1;
  reviews: any[] = [];
  fileUrl = '';

  throttle = 300;
  scrollDistance = 2;
  scrollUpDistance = 2;

  ratingStatus: any = {};
  reviewDetail: any = {};
  res_name = '';

  constructor(private restaurantservice: RestaurantService, private spinner: NgxSpinnerService, private route: ActivatedRoute) { }

  ngOnInit() {
    this.spinner.show()
    this.fileUrl = environment.fileurl + '/'
    this.res_id = parseInt(this.route.snapshot.paramMap.get("id"));
    this.getReviews()

    //get overall review
    this.restaurantservice.getreviewstatus(this.res_id).subscribe(
      data => {

        if (data.status) {
          this.res_name = data.response[0][0].res_name
          this.ratingStatus['avgrating'] = Number(data.response[0][0].avgrating.toFixed(2))
          this.ratingStatus['oneratingcount'] = Number(data.response[1][0].oneratingcount.toFixed(2))
          this.ratingStatus['tworatingcount'] = Number(data.response[2][0].tworatingcount.toFixed(2))
          this.ratingStatus['threeratingcount'] = Number(data.response[3][0].threeratingcount.toFixed(2))
          this.ratingStatus['fourratingcount'] = Number(data.response[4][0].fourratingcount.toFixed(2))
          this.ratingStatus['fiveratingcount'] = Number(data.response[5][0].fiveratingcount.toFixed(2))
        }
      },
      err => {

      }
    ).add(() => {
      this.spinner.hide()
    })
  }
  onScrollDown() {
    this.page++
    this.getReviews();
    this.direction = 'down'
  }

  onUp() {
    // console.log('scrolled up!', ev);
    this.direction = 'up';
  }


  getReviews() {
    this.spinner.show()
    //gallery images
    this.restaurantservice.getReview({ res_id: this.res_id, page: this.page }).subscribe(
      data => {
        if (data.status) {
          data.data.forEach(ele => {
            this.reviews.push(ele);
          });
        }


      },
      err => {

      }
    ).add(() => {
      this.spinner.hide()
    })
  }

  openratings(item) {
    this.reviewDetail = {}
    this.reviewDetail = item
    $('.write-review-pop').modal('show')
  }
}
