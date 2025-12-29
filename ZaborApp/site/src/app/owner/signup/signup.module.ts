import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { ReactiveFormsModule } from "@angular/forms";

import { SignupRoutingModule } from "./signup-routing.module";
import { SignupComponent } from "./signup.component";
import { LangRadioModule } from "src/app/shared/modules/front/lang-radio/lang-radio.module";

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        SignupRoutingModule,
        ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
        LangRadioModule
    ],
    declarations: [SignupComponent]
})
export class SignupModule {}
