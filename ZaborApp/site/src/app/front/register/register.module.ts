import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RegisterRoutingModule } from './register-routing.module';
import { RegisterComponent } from './register.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SocialloginModule } from './../../shared/modules/front/sociallogin/sociallogin.module'
import { LangChangeModule } from 'src/app/shared/modules/front/lang-change/lang-change.module';

@NgModule({
  declarations: [RegisterComponent],
  imports: [
    CommonModule,
    RegisterRoutingModule,
    FormsModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    TranslateModule,
    SocialloginModule,
    LangChangeModule
  ]
})
export class RegisterModule { }
