import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DriverRoutingModule } from './driver-routing.module';
import { DriverComponent } from './driver.component';
import { DataTablesModule } from 'angular-datatables';
import { ViewComponent } from './view/view.component';

@NgModule({
  declarations: [DriverComponent, ViewComponent],
  imports: [
    CommonModule,
    DriverRoutingModule,
    DataTablesModule
  ]
})
export class DriverModule { }
