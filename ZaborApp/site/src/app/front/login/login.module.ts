import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoginRoutingModule } from './login-routing.module';
import { LoginComponent } from './login.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SocialloginModule } from './../../shared/modules/front/sociallogin/sociallogin.module';
import { LangChangeModule } from './../../shared/modules/front/lang-change/lang-change.module';
import { PictureLoadPipe } from './picture-load.pipe';


@NgModule({
  declarations: [LoginComponent, PictureLoadPipe],
  imports: [
    CommonModule,
    LoginRoutingModule,
    FormsModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    TranslateModule,
    SocialloginModule,
    LangChangeModule
  ],

})
export class LoginModule { }
