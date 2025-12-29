import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { UserfeedbackRoutingModule } from './userfeedback-routing.module';
import { UserfeedbackComponent } from './userfeedback.component';


@NgModule({
    imports: [
        CommonModule,
        UserfeedbackRoutingModule,
        DataTablesModule,
    ],
    declarations: [UserfeedbackComponent]

})
export class UserfeedbackModule { }
