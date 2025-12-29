import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { FrontRoutingModule } from './front-routing.module';
import { ResetpasswordComponent } from './resetpassword/resetpassword.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActiveuserComponent } from './activeuser/activeuser.component';
import { TranslateModule } from '@ngx-translate/core';
import { LangChangeModule } from '../shared/modules/front/lang-change/lang-change.module';

@NgModule({
  declarations: [ResetpasswordComponent, ActiveuserComponent],
  imports: [
    CommonModule,
    FrontRoutingModule,
    FormsModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    TranslateModule,
    LangChangeModule
  ]
})
export class FrontModule { }
