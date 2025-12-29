import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { DriversRoutingModule } from './drivers-routing.module';
import { DriversComponent } from './drivers.component';
import { UiSwitchModule } from 'ngx-ui-switch';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ViewComponent } from './view/view.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

@NgModule({
  declarations: [DriversComponent, ViewComponent],
  imports: [
    CommonModule,
    DriversRoutingModule,
    DataTablesModule,
    UiSwitchModule,
    FormsModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    NgxDaterangepickerMd.forRoot()
  ]
})
export class DriversModule { }
