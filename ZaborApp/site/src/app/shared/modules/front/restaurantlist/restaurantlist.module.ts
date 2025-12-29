import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantlistComponent } from './restaurantlist.component';
import { RouterModule } from '@angular/router';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { RatingModule } from 'ng-starrating';
import { SharedPipesModule } from '../../../pipes/shared-pipes.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [RestaurantlistComponent],
  imports: [
    CommonModule,
    RouterModule,
    InfiniteScrollModule,
    RatingModule,
    SharedPipesModule,
    TranslateModule
  ],
  exports: [RestaurantlistComponent]

})
export class RestaurantlistModule { }
