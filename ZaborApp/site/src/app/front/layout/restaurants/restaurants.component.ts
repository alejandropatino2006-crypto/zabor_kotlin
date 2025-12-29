import { Component, OnInit, ViewChild, AfterViewInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router, NavigationEnd } from '@angular/router';
import { RestaurantService } from '../../../shared/services/frontServices/restaurant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../shared/helpers/swalFunctionsData';

@Component({
  selector: 'app-restaurants',
  templateUrl: './restaurants.component.html'
})
export class RestaurantsComponent implements OnInit, OnDestroy, AfterViewInit {

  public search: string;
  public restaurants: Array<any> = [];
  public lat: any
  public long: any;
  public selectedFilter: string = ""
  public Routersubscription: any;

  @ViewChild('childComp') childcomp: any;
  city: string;

  constructor(private _route: Router, private route: ActivatedRoute, private restaurantservice: RestaurantService, private spinner: NgxSpinnerService) {
    this.search = "";
    this.city = "";
    this.lat = localStorage.getItem('lat');
    this.long = localStorage.getItem('long');
    this.restaurants = []
  }

  ngOnInit() {

  }

  ngAfterViewInit() {
    // this.routeEvent(this._route)
    this.Routersubscription = this.route.queryParams
      .subscribe(params => {
        this.search = params.search;
        this.city = params.city
        this.restaurants = []

        //this.newRestaurant()
        this.childcomp.ResetPage()
      });
  }

  ngOnDestroy() {
    this.Routersubscription.unsubscribe()
  }

  public newRestaurant(page = 1) {
    if (this.search.trim() == '' && this.city == '')
      return

    this.spinner.show();
    this.restaurantservice.getRestaurants(this.search, this.city, page, this.lat, this.long).subscribe(
      data => {

        if (data.status) {
          data.data.response.forEach(element => {
            this.restaurants.push(element);
          });
        }
      },
      error => {

      }
    ).add(() => {
      this.spinner.hide();
    })
  }

  openMenu() {
    $('.fillter-dropdown-menu').slideToggle()
  }

  hideManu() {
    $('.fillter-dropdown-menu').slideToggle()
  }

  selectFilter(type) {
    this.selectedFilter = type
    $('.fillter-dropdown-menu').slideToggle()
  }
}
