import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RestaurantDetailRoutingModule } from './restaurant-detail-routing.module';
import { RestaurantDetailComponent } from './restaurant-detail.component';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { AgmCoreModule } from '@agm/core';
import { environment } from 'src/environments/environment';
import { RatingModule } from 'ng-starrating';
import { SharedPipesModule } from 'src/app/shared';
import { TranslateModule } from '@ngx-translate/core';
import { OffersModule } from './../../../shared/modules/front/offers/offers.module'

@NgModule({
  declarations: [RestaurantDetailComponent],
  imports: [
    CommonModule,
    RestaurantDetailRoutingModule,
    CarouselModule,
    RatingModule,
    SharedPipesModule,
    RatingModule,
    TranslateModule,
    OffersModule,
    AgmCoreModule.forRoot({
      apiKey: environment.GoogleMapApiKey,
      libraries: ['places']
    }),
  ]
})
export class RestaurantDetailModule { }
