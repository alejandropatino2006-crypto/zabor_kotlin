import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from "@ngx-translate/core";
import { DriverRegRoutingModule } from './driver-reg-routing.module';
import { DriverRegComponent } from './driver-reg.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';

@NgModule({
  declarations: [DriverRegComponent],
  imports: [
    CommonModule,
    DriverRegRoutingModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    TranslateModule,
    NgxDaterangepickerMd.forRoot()
  ]
})
export class DriverRegModule { }
