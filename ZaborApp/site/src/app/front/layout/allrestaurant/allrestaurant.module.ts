import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from "@ngx-translate/core";
import { AllrestaurantRoutingModule } from './allrestaurant-routing.module';
import { AllrestaurantComponent } from './allrestaurant.component';
import { SearchbannerModule } from 'src/app/shared/modules/front/searchbanner/searchbanner.module';
import { RestaurantlistModule } from 'src/app/shared/modules/front/restaurantlist/restaurantlist.module';

@NgModule({
  declarations: [AllrestaurantComponent],
  imports: [
    CommonModule,
    AllrestaurantRoutingModule,
    TranslateModule,
    RestaurantlistModule,
    SearchbannerModule
  ]
})
export class AllrestaurantModule { }
