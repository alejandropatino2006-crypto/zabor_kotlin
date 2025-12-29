import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { SettingRoutingModule } from './setting-routing.module';
import { SettingComponent } from './setting.component';
import { RichTextEditorModule } from '@syncfusion/ej2-angular-richtexteditor';
// import { RichTextEditorAllModule } from '@syncfusion/ej2-angular-richtexteditor';
import { UploadFileComponent } from './upload-file/upload-file.component';
import { DemoMaterialModule } from './material-module';

@NgModule({
  declarations: [SettingComponent, UploadFileComponent],
  imports: [
    CommonModule,
    SettingRoutingModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    FormsModule,
    RichTextEditorModule,
    DemoMaterialModule
  ]
})
export class SettingModule { }
