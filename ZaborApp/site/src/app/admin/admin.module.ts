import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import {AdminAuthGuard} from '../shared';
import { AdminRoutingModule } from './admin-routing.module';

@NgModule({
    imports: [
        CommonModule,
        AdminRoutingModule,
    ],
    declarations: [
    ],
    providers: [AdminAuthGuard],
})
export class AdminModule { }
