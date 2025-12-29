import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRoutingModule } from './user-routing.module';
import { UserComponent } from './user.component';
import { EditComponent } from './edit/edit.component';
import { ListComponent } from './list/list.component';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';
import { UiSwitchModule } from 'ngx-ui-switch';


@NgModule({
    imports: [
        CommonModule,
        UserRoutingModule,
        DataTablesModule,
        UiSwitchModule,
        FormsModule,
        ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
        ImageCropperModule


    ],
    declarations: [UserComponent, EditComponent, ListComponent]

})
export class UserModule { }
