import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StaticpagesRoutingModule } from './staticpages-routing.module';

import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { RichTextEditorModule } from '@syncfusion/ej2-angular-richtexteditor';
// import { RichTextEditorAllModule } from '@syncfusion/ej2-angular-richtexteditor';
import { AddComponent } from './add/add.component';
import { EditComponent } from './edit/edit.component';

@NgModule({
    imports: [
        CommonModule,
        StaticpagesRoutingModule,
        FormsModule,
        ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
        CKEditorModule,
        RichTextEditorModule
    ],
    declarations: [AddComponent, EditComponent]

})
export class StaticpagesModule { }
