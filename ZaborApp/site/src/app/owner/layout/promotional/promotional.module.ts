import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';
import { UiSwitchModule } from 'ngx-ui-switch';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
// import { AngularMultiSelectModule } from '../../../library/angular2-multiselect-dropdown';
import { AmazingTimePickerModule } from 'src/app/library/atp-library/atp-time-picker.module';
import { PromotionalRoutingModule } from './promotional-routing.module';
import { AdvertComponent } from './advert/advert.component';
import { VideoComponent } from './video/video.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { VideoProcessingService } from '../../../shared/services/video-processing.service';
import { NgxSmartModalModule } from 'ngx-smart-modal';
import { TranslateModule } from '@ngx-translate/core';
import {CustomFileButtonModule} from "src/app/shared/modules/front/custom-file-button/custom-file-button.module";

@NgModule({
    imports: [
        CommonModule,
        PromotionalRoutingModule,
        DataTablesModule,
        AmazingTimePickerModule,
        UiSwitchModule,
        FormsModule,
        ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
        ImageCropperModule,
        AngularMultiSelectModule,
        NgxDaterangepickerMd.forRoot(),
        NgxSmartModalModule.forRoot(),
        TranslateModule,
        CustomFileButtonModule
    ],
    providers: [
        VideoProcessingService
    ],
    declarations: [AdvertComponent, VideoComponent]

})
export class PromotionalModule { }
