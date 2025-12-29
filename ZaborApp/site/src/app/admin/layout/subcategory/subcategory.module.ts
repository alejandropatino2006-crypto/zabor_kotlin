import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SubcategoryRoutingModule } from './subcategory-routing.module';
import { SubcategoryComponent } from './subcategory.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { DataTablesModule } from 'angular-datatables';


@NgModule({
    imports: [
        CommonModule,
        SubcategoryRoutingModule,
        FormsModule,
        ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
        DataTablesModule,

    ],
    declarations: [SubcategoryComponent]

})
export class SubcategoryModule { }
