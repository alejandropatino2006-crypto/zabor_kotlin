import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { OwnerAuthGuard } from '../shared/guard/owner.auth.guard';
import { UserRoutingModule } from './user-routing.module';
import {ActiveOwnerComponent} from './activeowner/activeowner.component';
import {TranslateModule} from '@ngx-translate/core';
import { LangChangeModule } from '../shared/modules/front/lang-change/lang-change.module';



@NgModule({
    imports: [
        CommonModule,
        UserRoutingModule,
        TranslateModule,
        LangChangeModule
    ],

    providers: [OwnerAuthGuard],

    declarations: [ActiveOwnerComponent],
})
export class UserModule { }
