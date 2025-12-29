import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { RestaurantService } from '../../../shared/services/frontServices/restaurant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../shared/helpers/swalFunctionsData';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-cat-restaurant',
  templateUrl: './cat-restaurant.component.html'
})
export class CatRestaurantComponent implements OnInit, OnDestroy {

  public catID: number;
  public page: number;
  public restaurants: Array<any> = [];
  public lat: any
  public long: any;
  public Routersubscription: any;

  constructor(private _route: Router, private route: ActivatedRoute, private restaurantservice: RestaurantService, private spinner: NgxSpinnerService, private translate: TranslateService) {
    this.restaurants = []
    this.lat = localStorage.getItem('lat');
    this.long = localStorage.getItem('long');
  }

  ngOnInit() {

    this.catID = parseInt(this.route.snapshot.paramMap.get("id"))
    this.routeEvent(this._route)
  }

  routeEvent(router: Router) {

    this.Routersubscription = router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.catID = parseInt(this.route.snapshot.paramMap.get("id"));
        this.restaurants = []
        this.newRestaurant()
      }
    });
  }
  ngOnDestroy() {
    this.Routersubscription.unsubscribe()
  }

  public newRestaurant(page = 1) {
    this.spinner.show();
    this.restaurantservice.getCatRestaurant(this.catID, page, this.lat, this.long).subscribe(
      data => {
        if (data.status) {
          data.data.restaurant.forEach(element => {
            this.restaurants.push(element)
          });
        }
      },
      error => {
      }
    ).add(() => {
      this.spinner.hide()
    })
  }

}
