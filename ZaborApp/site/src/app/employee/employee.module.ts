import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { EmployeeAuthGuard } from '../shared/guard/employee.auth.guard';
import { EmployeeRoutingModule } from './employee-routing.module';
import { DashboardComponent } from './dashboard/dashboard.component';
import { EmployeeComponent } from './employee.component';



@NgModule({
    imports: [
        CommonModule,
        EmployeeRoutingModule
    ],

    providers: [EmployeeAuthGuard],

    declarations: [DashboardComponent, EmployeeComponent],
})
export class EmployeeModule { }
