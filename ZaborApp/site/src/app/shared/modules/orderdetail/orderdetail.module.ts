import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderdetailComponent } from './orderdetail.component';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { OrderProgressBarModule } from './../../../shared/modules/order-progress-bar/order-progress-bar.module'
import { RouterModule } from '@angular/router';
import { SharedPipesModule } from 'src/app/shared';
import { InvoiceModule } from './invoice/invoice.module'


@NgModule({
  declarations: [OrderdetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    TranslateModule,
    OrderProgressBarModule,
    SharedPipesModule,
    RouterModule,
    InvoiceModule
  ],
  exports: [OrderdetailComponent]
})
export class OrderdetailModule { }
