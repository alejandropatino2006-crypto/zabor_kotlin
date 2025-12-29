import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { RestaurantDivComponent } from './restaurant-div.component'
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';


@NgModule({
  declarations: [RestaurantDivComponent],
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule
  ],
  exports: [RestaurantDivComponent]
})
export class RestaurantDivModule { }
