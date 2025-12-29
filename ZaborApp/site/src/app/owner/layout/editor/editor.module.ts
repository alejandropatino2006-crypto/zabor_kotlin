import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from "@angular/forms";
import { EditorRoutingModule } from './editor-routing.module';
import { EditorComponent } from './editor.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [EditorComponent],
  imports: [
    CommonModule,
    EditorRoutingModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    TranslateModule
  ]
})
export class EditorModule { }
