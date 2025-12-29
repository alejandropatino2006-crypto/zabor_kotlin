import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import {DataTablesModule} from 'angular-datatables';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {FormsModule} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

import { StatModule } from '../../../shared';
import { ReportsRoutingModule } from './reports-routing.module';

import { SalesDashboardComponent } from './components/sales-dashboard.component';
import { SalesReportComponent, SalesByEmployeeComponent, TotalSalesByShiftComponent, SummarySalesByShiftComponent, SalesByItemComponent, BestSalesByItemComponent,
  SalesForMenuGroupComponent, SalesByDeliveryComponent, SalesByTakeoutComponent, SalesByDineinComponent, SalesByBartagComponent, PayoutsComponent, ReturnsComponent, SummarySalesByMenuGroupComponent,
  SalesByKioskComponent, AllSalesByShiftAndDateComponent } from './components';

@NgModule({
  // tslint:disable-next-line:max-line-length
  declarations: [SalesDashboardComponent, SalesReportComponent, SalesByEmployeeComponent, TotalSalesByShiftComponent, SummarySalesByShiftComponent, SalesByItemComponent, BestSalesByItemComponent,
    SalesForMenuGroupComponent, SalesByDeliveryComponent, SalesByTakeoutComponent, SalesByDineinComponent, SalesByBartagComponent, PayoutsComponent, ReturnsComponent, SummarySalesByMenuGroupComponent,
    SalesByKioskComponent, AllSalesByShiftAndDateComponent],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    DataTablesModule,
    FormsModule,
    NgxDaterangepickerMd.forRoot(),
    TranslateModule,
    StatModule
  ]
})
export class ReportsModule { }
