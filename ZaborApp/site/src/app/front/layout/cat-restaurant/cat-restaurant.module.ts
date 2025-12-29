import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CatRestaurantRoutingModule } from './cat-restaurant-routing.module';
import { RestaurantlistModule } from '../../../shared/modules/front/restaurantlist/restaurantlist.module';
import { CatRestaurantComponent } from './cat-restaurant.component';
import { SearchbannerModule } from './../../../shared/modules/front/searchbanner/searchbanner.module'


@NgModule({
  declarations: [CatRestaurantComponent],
  imports: [
    CommonModule,
    CatRestaurantRoutingModule,
    RestaurantlistModule,
    SearchbannerModule
  ]
})
export class CatRestaurantModule { }
