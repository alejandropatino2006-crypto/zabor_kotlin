import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { PromotionalRoutingModule } from './promotional-routing.module';
import { AdvertComponent } from './advert/advert.component';
import { VideoComponent } from './video/video.component';
import { DataTablesModule } from 'angular-datatables';
import { UiSwitchModule } from 'ngx-ui-switch';
import { TranslateModule } from '@ngx-translate/core';
import { DatatableNetModule } from '../../../shared/modules/datatable-net/datatable-net.module';

@NgModule({
  declarations: [AdvertComponent, VideoComponent],
    imports: [
        CommonModule,
        PromotionalRoutingModule,
        DataTablesModule,
        UiSwitchModule,
        TranslateModule,
        DatatableNetModule
    ]
})
export class PromotionalModule { }
