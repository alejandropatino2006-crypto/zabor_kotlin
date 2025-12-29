import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { RestaurantService } from '../../../shared/services/frontServices/restaurant.service';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-allrestaurant',
  templateUrl: './allrestaurant.component.html',
})

export class AllrestaurantComponent implements OnInit, OnDestroy {

  public type: number;
  public page: number;
  public restaurants: Array<any>;
  public lat: any
  public long: any;
  public Routersubscription: any;
  public selectedFilter: number = 1;
  public showFilter: boolean = false;

  @ViewChild('Child') Child: any;

  constructor(private _route: Router, private route: ActivatedRoute, private restaurantservice: RestaurantService, private spinner: NgxSpinnerService, private translate: TranslateService) {
    this.restaurants = []
    this.lat = localStorage.getItem('lat');
    this.long = localStorage.getItem('long');
  }

  ngOnInit() {
    // 1: popular
    // 2: newRestaurant
    // 3:review
    // 4:newest
    //5:popular
    this.type = parseInt(this.route.snapshot.paramMap.get("id"))
    this.selectedFilter = this.type
    this.routeEvent(this._route)

  }

  routeEvent(router: Router) {
    this.Routersubscription = router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        this.type = parseInt(this.route.snapshot.paramMap.get("id"));
        this.selectFilter(this.type)
      }
    });
  }

  ngOnDestroy() {
    this.Routersubscription.unsubscribe()
  }

  public newRestaurant(page = 1) {
    this.spinner.show();

    this.restaurantservice.getAllRestaurant(this.selectedFilter, page, this.lat, this.long).subscribe(
      data => {
        console.log("getAllRestaurant: ", data)
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

  openMenu() {
    $('.fillter-dropdown-menu').slideToggle()
  }

  hideManu() {
    $('.fillter-dropdown-menu').slideToggle()
  }

  selectFilter(type) {
    this.selectedFilter = type
    $('.fillter-dropdown-menu').slideToggle()

    this.restaurants = [];

    this.Child.ResetPage()
    //this.newRestaurant()
  }
}
