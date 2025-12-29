import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { SalesReportComponent } from './components';
import {DataTablesModule} from 'angular-datatables';
import {NgxDaterangepickerMd} from 'ngx-daterangepicker-material';
import {FormsModule} from '@angular/forms';
import { DatatableNetModule } from '../../../shared/modules/datatable-net/datatable-net.module';
import { NgSelectModule } from '@ng-select/ng-select';

@NgModule({
  imports: [
    CommonModule,
    ReportsRoutingModule,
    DataTablesModule,
    FormsModule,
    NgxDaterangepickerMd.forRoot(),
    DatatableNetModule,
    NgSelectModule,
  ],
  declarations: [SalesReportComponent],
})
export class ReportsModule { }
