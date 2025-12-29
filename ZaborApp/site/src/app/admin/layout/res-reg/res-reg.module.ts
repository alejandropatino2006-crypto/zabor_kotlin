import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ResRegRoutingModule } from './res-reg-routing.module';
import { ResRegComponent } from './res-reg.component';
import { ViewComponent } from './view/view.component';
import { DataTablesModule } from 'angular-datatables';


@NgModule({
  declarations: [ResRegComponent, ViewComponent],
  imports: [
    CommonModule,
    ResRegRoutingModule,
    DataTablesModule
  ]
})
export class ResRegModule { }
