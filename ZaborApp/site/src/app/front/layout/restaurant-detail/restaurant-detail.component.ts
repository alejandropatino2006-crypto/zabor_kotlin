import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { RestaurantService } from '../../../shared/services/frontServices/restaurant.service';
import { TranslationService } from '../../../shared/services/translation.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../shared/helpers/swalFunctionsData';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { MapsAPILoader } from '@agm/core';
import { environment } from "../../../../environments/environment";
import { Subscription } from 'rxjs';
declare var $: any;

@Component({
  selector: 'app-restaurant-detail',
  templateUrl: './restaurant-detail.component.html',
  styleUrls: ['./restaurant-detail.component.scss'],
  styles: ['agm-map { height: 400px}', '.form-control[readonly]{background-color: #ffffff }', '.profile-pic-div{ width: 100px; height: 100px; border: 1px gray solid; }', '.badge-light a{color: #222222;}', '.table th, .table td{padding: 0 0.75rem; border-top:none}', '.detail-pic-overlay .btn{z-index:1000}'],

})
export class RestaurantDetailComponent implements OnInit, OnDestroy {

  public subscriber: Subscription
  public res_id: number
  public customOptions: OwlOptions;
  public resdetail: any;
  public opencloseTime: any;
  public review: any = [];
  public fileUrl: string = environment.fileurl + '/';
  public resImg: any;
  public popularRes: any;

  lat;
  lng;
  zoom;
  Routersubscription: any;
  public resOpened: boolean = false;

  public rating: object = {
    waiting: 0,
    restrooms: 0,
    ambience: 0,
    service: 0,
    food: 0,
    pricing: 0,
    management: 0,
    locality: 0
  }

  discounts: Array<any> = []
  @ViewChild('commentSec') input;

  // tslint:disable-next-line:max-line-length
  constructor(public translation: TranslationService, private _route: Router, private mapsAPILoader: MapsAPILoader, private restaurantservice: RestaurantService, private spinner: NgxSpinnerService, private route: ActivatedRoute,) {
    this.popularRes = [];
    this.customOptions = {
      loop: true,
      mouseDrag: true,
      touchDrag: true,
      autoHeight: true,
      pullDrag: true,
      dots: false,
      navSpeed: 700,
      navText: ['<', '>'],
      responsive: {
        0: {
          items: 1
        },
        400: {
          items: 2
        },
        740: {
          items: 3
        },
        940: {
          items: 5
        }
      },
      nav: true
    }
  }

  ngOnInit() {

    //get restaurant id
    this.res_id = parseInt(this.route.snapshot.paramMap.get("id"));
    this.getRestaurantDetail()
    this.routeEvent(this._route);
    // this.checkifResAvailable()
  }

  openRatingModal() {
    if (localStorage.getItem('currentUserId')) {
      $('#Write-Review').modal('show')
    } else {
      this._route.navigate(['/login']);
    }
  }


  //get restaurantdetail
  getRestaurantDetail() {
    if (this.res_id > 0) {
      this.spinner.show()
      this.subscriber = this.restaurantservice.getRestaurantdetail(this.res_id).subscribe(
        data => {
          if (data.status) {
            console.log("resDetail: ", data)
            this.resdetail = data.data.restaurantDetail[0];
            this.opencloseTime = data.data.openclosetime[0];
            this.review = data.data.review;
            this.resImg = data.data.galleryImages;

            this.lat = data.data.restaurantDetail[0].latitude;
            this.lng = data.data.restaurantDetail[0].longitude;
            this.resOpened = this.restaurantservice.checkifResAvailable(this.opencloseTime) && data.data.restaurantDetail[0].status == 1

            this.discounts = data.data.discounts
          }
        },
        error => {
        }
      ).add(() => {
        this.spinner.hide();


        //this.getGalleryImages()
        this.getPopularRestaurant()
      })
    } else {

    }
    this.mapsAPILoader.load()
  }

  distance(lat1, lon1, lat2, lon2, unit) {
    if ((lat1 == lat2) && (lon1 == lon2)) {
      return 0;
    }
    else {
      var radlat1 = Math.PI * lat1 / 180;
      var radlat2 = Math.PI * lat2 / 180;
      var theta = lon1 - lon2;
      var radtheta = Math.PI * theta / 180;
      var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
      if (dist > 1) {
        dist = 1;
      }
      dist = Math.acos(dist);
      dist = dist * 180 / Math.PI;
      dist = dist * 60 * 1.1515;
      if (unit == "K") { dist = dist * 1.609344 }
      if (unit == "N") { dist = dist * 0.8684 }
      return dist;
    }
  }

  routeEvent(router: Router) {
    this.Routersubscription = router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.reset();
        this.res_id = parseInt(this.route.snapshot.paramMap.get("id"));
        this.getRestaurantDetail()
      }
    });
  }

  ngOnDestroy() {
    this.Routersubscription.unsubscribe()
  }
  //get popular Restaurant
  getPopularRestaurant() {
    this.spinner.show();
    this.restaurantservice.getPopularRestaurant().subscribe(
      data => {
        if (data.status) {
          this.popularRes = this.getRandom4Res(data.data.restaurant);
        }
      },
      err => {

      }
    ).add(() => {
      this.spinner.hide();
    })
  }
  getDateFormated(date) {

    let d = new Date(date)
    var datestring = d.getDate() + "/" + (d.getMonth() + 1) + "/" + d.getFullYear();

    return datestring;
  }

  reset() {
    this.resOpened = false
    this.res_id = -1;
    this.resdetail = [];
    this.popularRes = [];
    this.review = [];
    this.resImg = [];
    this.lat = [];
    this.lng = [];
    this.opencloseTime = []
  }


  getRandom4Res(res) {
    if (res.length > 4) {
      //get random 4 restaurant
      let temp = [];
      let returnObj = [];
      Math.floor(Math.random() * res.length)

      for (let index = 0; index < 100; index++) {
        let tempIndex = Math.floor(Math.random() * res.length);
        if (!temp.includes(tempIndex)) {
          temp.push(tempIndex);
          returnObj.push(res[tempIndex]);
          if (returnObj.length == 4)
            break;
        }
      }
      return returnObj;
    }
    return res;
  }


  RateWaiting(e) {
    this.rating['waiting'] = e.newValue;
  }

  RateFood(e) {
    this.rating['food'] = e.newValue;
  }
  RateRestroom(e) {
    this.rating['restrooms'] = e.newValue
  }

  RatePrice(e) {
    this.rating['pricing'] = e.newValue
  }

  RateAmbience(e) {
    this.rating['ambience'] = e.newValue
  }

  RateManagement(e) {
    this.rating['management'] = e.newValue
  }

  RateService(e) {
    this.rating['service'] = e.newValue;
  }

  RateLocality(e) {
    this.rating['locality'] = e.newValue
  }

  submitRating() {
    if (localStorage.getItem('currentUserId')) {

      this.rating['comment'] = this.input.nativeElement.value;
      this.rating['user_id'] = parseInt(localStorage.getItem('currentUserId'));
      this.rating['res_id'] = this.res_id

      this.spinner.show()
      this.restaurantservice.rateRestaurant(this.rating).subscribe(
        data => {

          if (data.status) {
            Swal.fire(Swaldata.SwalSuccessToast('Review Successfully Submitted'))
            this.review = data.data
          } else
            Swal.fire(Swaldata.SwalErrorToast('Something went wrong'))
        },
        err => {
          Swal.fire(Swaldata.SwalErrorToast('Something went wrong'))
        }
      ).add(() => {
        this.spinner.hide();
        $('#Write-Review').modal('hide')
      })
    } else {
      return;
    }
  }


}
