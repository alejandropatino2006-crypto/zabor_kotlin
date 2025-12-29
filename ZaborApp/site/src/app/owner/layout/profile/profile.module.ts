import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileComponent } from './profile.component';

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ImageCropperModule } from 'ngx-image-cropper';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule,
        ProfileRoutingModule,
        FormsModule,
        ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
        ImageCropperModule,
        NgxDaterangepickerMd.forRoot(),
        TranslateModule
    ],
    declarations: [ProfileComponent]

})
export class ProfileModule { }
