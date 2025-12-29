import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from "@ngx-translate/core";
import { DashboardRoutingModule } from './dashboard-routing.module';
import { DashboardComponent } from './dashboard.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { AgmCoreModule } from '@agm/core';
import { environment } from 'src/environments/environment';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';

@NgModule({
  declarations: [DashboardComponent],
  imports: [
    CommonModule,
    DashboardRoutingModule,
    FormsModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    ImageCropperModule,
    NgxDaterangepickerMd.forRoot(),
    TranslateModule,
    InfiniteScrollModule,
    AgmCoreModule.forRoot({
      apiKey: environment.GoogleMapApiKey,
      libraries: ['places']
    }),
  ]
})
export class DashboardModule { }
