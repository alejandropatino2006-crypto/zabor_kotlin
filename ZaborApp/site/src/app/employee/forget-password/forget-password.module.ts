import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";

import { ForgetPasswordRoutingModule } from "./forget-password-routing.module";
import { ForgetPasswordComponent } from "./forget-password.component";

import { ReactiveFormsModule, FormsModule } from "@angular/forms";

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        FormsModule,
        ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
        ForgetPasswordRoutingModule,
    ],
    declarations: [ForgetPasswordComponent]
})
export class ForgetPasswordModule { }
