import { Component, OnInit, OnDestroy, ElementRef, ViewChild, NgZone, AfterViewInit } from '@angular/core';
import { RestaurantService } from '../../../shared/services/frontServices/restaurant.service';
import { UserService } from '../../../shared/services/frontServices/user.service';
import { FormBuilder, FormGroup, Validators, FormControl } from "@angular/forms";
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../shared/helpers/swalFunctionsData';
import { environment } from "../../../../environments/environment";
import { Router } from '@angular/router';
import { MapsAPILoader } from '@agm/core';
import { OwlOptions } from 'ngx-owl-carousel-o';
import { TranslationService } from '././../../../shared/services/translation.service';
declare var $: any;

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styles: ['agm-map { height: 400px}', '.form-control[readonly]{background-color: #ffffff }', '.viewall-link{font-size:16px;text-decoration: underline;color:#222222 !important}', '.driver-reg{padding: 15px 10px;}', '.owl-theme .owl-nav{margin-top:-50px !important}', '.loc-url{color: #533f0a;font-size: 18px;float: right;margin-bottom:20px;}', '.top-sec{padding: 50px 0 !important;}', '.driver-reg a{width:100%}'],
})
export class HomeComponent implements OnInit, AfterViewInit, OnDestroy {

  public lat: number
  public long: number
  public popularRes: Array<any>;
  public newRes: Array<any>;
  public ourRes: Array<any>;
  public fileurl: string;
  public searchValue: string;

  public advertType = 0;
  public advert: Array<any> = [];


  public zoom: any = 10;
  public searchControl: FormControl;
  public customOptions: OwlOptions;

  @ViewChild("search")
  public searchElementRef: ElementRef;
  public ongoingOrders: any = {};

  // tslint:disable-next-line:max-line-length
  constructor(public translation: TranslationService, private mapsAPILoader: MapsAPILoader, private ngZone: NgZone, private router: Router,
              private restaurantService: RestaurantService, private spinner: NgxSpinnerService, public userService: UserService,
              ) {
    this.searchValue = '';
    this.popularRes = [];
    this.newRes = [];
    this.ourRes = [];

    this.fileurl = environment.fileurl + '/';
    this.customOptions = {
      loop: true,
      mouseDrag: true,
      touchDrag: true,
      autoHeight: true,
      pullDrag: true,
      dots: true,
      navSpeed: 700,
      navText: ['<', '>'],
      responsive: {
        0: {
          items: 1
        },
        400: {
          items: 1
        },
        740: {
          items: 1
        },
        940: {
          items: 1
        }
      },
      nav: false
    }

  }

  chooseLocation(event) {
    this.lat = event.coords.lat;
    this.long = event.coords.lng;

    let geocoder = new google.maps.Geocoder();
    geocoder.geocode({ 'location': { lat: this.lat, lng: this.long } }, (results) => {
      if (results[0]) {
        this.searchElementRef.nativeElement.value = results[0].formatted_address

      }
    });
  }

  setAddressCordinate() {
    localStorage.setItem('lat', this.lat.toString());
    localStorage.setItem('long', this.long.toString());

    this.getHomeRestaurants()
    $('#locationModal').modal('hide')
  }

  ngOnInit() {
    $('body').addClass('home');
    if (localStorage.getItem('lat') && localStorage.getItem('long')) {
      this.lat = Number(localStorage.getItem('lat'))
      this.long = Number(localStorage.getItem('long'))
      this.getHomeRestaurants()
    }

    if (localStorage.getItem('currentUserId')) {
      this.spinner.show();
      this.restaurantService.getongoingOrders(localStorage.getItem('currentUserId')).subscribe(
        data => {
          if (data.status) {
            this.ongoingOrders = data.data[0]; // get getongoingOrders orders
          }
        }
      ).add(() => {
        // this.requestFcmPermission();
        this.spinner.hide();
      })
    }
  }

  // requestFcmPermission() {
  //   console.log('Requesting FCM permission...');
  //   Notification.requestPermission().then((permission) => {
  //     if (permission === 'granted') {
  //       console.log('FCM Notification permission granted.');
  //       setTimeout(() => {
  //         // const storedFcmToken = this.clientStorage.retrieveFcmToken();
  //         const storedFcmToken = localStorage.getItem('fcmToken');
  //         if (storedFcmToken != null) {
  //           this.userService.testFcmMessage().subscribe();
  //         }
  //       }, 3000);
  //     } else {
  //       console.warn('FCM Notification permission denied.');
  //     }
  //   });
  // }

  ngAfterViewInit() {
    if (localStorage.getItem('lat') && localStorage.getItem('long')) {
      return;
    }
    else {
      this.getLocation();
    }
  }
  //get location
  getLocation() {
    this.lat = Number('18.031375711202156');
    this.long = Number('-66.58788262722524');

    this.searchControl = new FormControl();

    $('#locationModal').modal('show');

    //load Places Autocomplete
    this.mapsAPILoader.load().then(() => {
      if (window.navigator && window.navigator.geolocation) {
        window.navigator.geolocation.getCurrentPosition(
          position => {
            this.lat = position.coords.latitude;
            this.long = position.coords.longitude;

            let geocoder = new google.maps.Geocoder();
            geocoder.geocode({ 'location': { lat: this.lat, lng: this.long } }, (results) => {
              if (results[0]) {
                this.searchElementRef.nativeElement.value = results[0].formatted_address
              }
            });
          },
        );

      };

      let autocomplete = new google.maps.places.Autocomplete(this.searchElementRef.nativeElement, {
        types: ["address"]
      });
      autocomplete.addListener("place_changed", () => {
        this.ngZone.run(() => {
          this.zoom = 15
          //get the place result
          let place: google.maps.places.PlaceResult = autocomplete.getPlace();
          //verify result
          if (place.geometry === undefined || place.geometry === null) {
            return;
          }
          //set latitude, longitude and zoom
          this.lat = place.geometry.location.lat();
          this.long = place.geometry.location.lng();
          //    this.getHomeRestaurants()

        });
      });
    });
  }

  getAdverts() {
    this.spinner.show()
    this.restaurantService.getAdverts(this.lat, this.long).subscribe(
      response => {
        if (response.status) {
          this.advertType = response.data.type
          this.advert = response.data.data
        }
      },
      err => {

      }
    ).add(() => {
      this.spinner.hide()
    })
  }

  checkResIsAvail() {
    //this.resOpened = this.restaurantservice.checkifResAvailable(this.opencloseTime) && data.data.restaurantDetail[0].status == 1
  }

  getHomeRestaurants() {

    //get restaurants
    this.restaurantService.getHomeRestaurant(this.lat, this.long).subscribe(
      data => {
        console.log("getHomeRestaurant: ", data)
        this.popularRes = [];
        this.newRes = [];
        this.ourRes = [];
        if (data.status) {
          if (data.data.mostpopular != null) {
            data.data.mostpopular.forEach((element, i) => {
              if (i < 4) {
                element['isAvail'] = this.restaurantService.checkifResAvailable(element) && element.status == 1 ? 1 : 0
                element['claimed'] = element.claimed
                this.popularRes.push(element);
              }
            });
          }
          data.data.newestRestaurant.forEach((element, i) => {
            if (i < 4) {
              element['isAvail'] = this.restaurantService.checkifResAvailable(element) && element.status == 1 ? 1 : 0
              element['claimed'] = element.claimed
              this.newRes.push(element);
            }
          });
          data.data.bannerRestaurant.forEach((element, i) => {
            if (i < 4) {
              element['isAvail'] = this.restaurantService.checkifResAvailable(element) && element.status == 1 ? 1 : 0
              element['claimed'] = element.claimed
              this.ourRes.push(element);
            }
          });

        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.msg));
        }
      },
      error => {
        Swal.fire(Swaldata.SwalErrorToast(error));
      }
    ).add(() => {
      this.spinner.hide();
      this.getAdverts()
    })

  }

  ngOnDestroy() {
    $('body').removeClass('home');
  }
  // search() {
  //   if (this.searchValue.trim() != '')
  //     this.router.navigate(['/restaurants'], { queryParams: { search: this.searchValue.trim() } });
  //   else
  //     Swal.fire(Swaldata.SwalErrorToast('Please enter restaurant '));
  // }

}
