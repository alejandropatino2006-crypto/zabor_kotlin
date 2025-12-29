import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RestaurantsRoutingModule } from './restaurants-routing.module';
import { RestaurantsComponent } from './restaurants.component';
import { RestaurantlistModule } from '../../../shared/modules/front/restaurantlist/restaurantlist.module';
import { SearchbannerModule } from './../../../shared/modules/front/searchbanner/searchbanner.module';

@NgModule({
  declarations: [RestaurantsComponent],
  imports: [
    CommonModule,
    RestaurantsRoutingModule,
    RestaurantlistModule,
    SearchbannerModule
  ]
})
export class RestaurantsModule { }
