import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CheckoutRoutingModule } from './checkout-routing.module';
import { CheckoutComponent } from './checkout.component';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { AgmCoreModule } from '@agm/core';
import { environment } from 'src/environments/environment';
import { OffersModule } from '../../../shared/modules/front/offers/offers.module'
import { CreditCardDirectivesModule } from 'angular-cc-library';
import { SharedPipesModule } from 'src/app/shared';


@NgModule({
  declarations: [CheckoutComponent],
  imports: [
    CommonModule,
    CheckoutRoutingModule,
    FormsModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    TranslateModule,
    OffersModule,
    SharedPipesModule,
    CreditCardDirectivesModule,
    AgmCoreModule.forRoot({
      apiKey: environment.GoogleMapApiKey,
      libraries: ['places']
    }),
  ]
})
export class CheckoutModule { }
