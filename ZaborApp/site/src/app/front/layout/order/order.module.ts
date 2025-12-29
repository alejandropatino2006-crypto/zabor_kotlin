import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderProgressBarModule } from './../../../shared/modules/order-progress-bar/order-progress-bar.module'
import { OrderRoutingModule } from './order-routing.module';
import { OrderComponent } from './order.component';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RatingModule } from 'ng-starrating';
import { CreditCardDirectivesModule } from 'angular-cc-library';
import { SharedPipesModule } from 'src/app/shared';
import { InvoiceModule } from './../../../shared/modules/orderdetail/invoice/invoice.module'

@NgModule({
  declarations: [OrderComponent],
  imports: [
    CommonModule,
    OrderRoutingModule,
    TranslateModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    OrderProgressBarModule,
    FormsModule,
    RatingModule,
    SharedPipesModule,
    CreditCardDirectivesModule,
    InvoiceModule
  ]
})
export class OrderModule { }
