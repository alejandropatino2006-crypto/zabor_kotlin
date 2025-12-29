import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { environment } from "../../../../../environments/environment";
import { RestaurantService } from '../../../services/frontServices/restaurant.service';

@Component({
  selector: 'app-restaurantlist',
  templateUrl: './restaurantlist.component.html'
})
export class RestaurantlistComponent implements OnInit {

  @Input() restaurants: Array<any> = [];
  @Output() childEvent = new EventEmitter();

  public fileUrl: string;
  public page: number;


  throttle = 300;
  scrollDistance = 1;
  scrollUpDistance = 2;
  direction = '';

  constructor(public restaurantService: RestaurantService) {
    this.page = 1;
    this.fileUrl = environment.fileurl + '/';
  }

  ngOnInit() {
    this.getRestaurants();
  }


  getRestaurants() {
    this.childEvent.emit(this.page);
  }

  ResetPage() {
    this.page = 1;
    this.getRestaurants()
  }
  onScrollDown() {
    // console.log('scrolled down!!', ev);
    this.page++
    this.getRestaurants();
    this.direction = 'down'
  }

  onUp() {
    // console.log('scrolled up!', ev);

    this.direction = 'up';
  }

}
