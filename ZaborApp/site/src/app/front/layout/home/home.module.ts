import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { TranslateModule } from "@ngx-translate/core";
import { RestaurantDivModule } from '../../../shared/modules/front/restaurant-div/restaurant-div.module';
import { SearchbannerModule } from '../../../shared/modules/front/searchbanner/searchbanner.module';
import { AgmCoreModule } from '@agm/core';
import { CarouselModule } from 'ngx-owl-carousel-o';
import { environment } from 'src/environments/environment';
import { SharedPipesModule } from 'src/app/shared';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    CommonModule,
    HomeRoutingModule,
    TranslateModule,
    RestaurantDivModule,
    FormsModule,
    SearchbannerModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    CarouselModule,
    SharedPipesModule,
    AgmCoreModule.forRoot({
      apiKey: environment.GoogleMapApiKey,
      libraries: ['places']
    }),
  ],
  exports: [HomeComponent]
})
export class HomeModule { }
