import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { OffersRoutingModule } from './offers-routing.module';
import { OffersComponent } from './offers.component';
import { OffersModule as offerm } from './../../../shared/modules/front/offers/offers.module'
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [OffersComponent],
  imports: [
    CommonModule,
    OffersRoutingModule,
    offerm,
    TranslateModule
  ]
})
export class OffersModule { }
