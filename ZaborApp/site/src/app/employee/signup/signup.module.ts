import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { TranslateModule } from "@ngx-translate/core";
import { ReactiveFormsModule } from "@angular/forms";

import { SignupRoutingModule } from "./signup-routing.module";
import { SignupComponent } from "./signup.component";

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        SignupRoutingModule,
        ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    ],
    declarations: [SignupComponent]
})
export class SignupModule {}
