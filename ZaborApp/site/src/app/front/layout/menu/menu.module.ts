import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MenuRoutingModule } from './menu-routing.module';
import { MenuComponent } from './menu.component';
import { TranslateModule } from "@ngx-translate/core";
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { SharedPipesModule } from 'src/app/shared';
import { StepsComponent } from './steps/steps.component';
import { StepTemplateComponent } from './step-template/step-template.component';
import { RegistrationStepsComponent } from './registration-steps/registration-steps.component';
import { LoginStepsComponent } from './login-steps/login-steps.component';
import { RegistrationStepTemplateComponent } from './registration-step-template/registration-step-template.component';
import { LoginStepTemplateComponent } from './login-step-template/login-step-template.component';

@NgModule({
  declarations: [MenuComponent, StepsComponent, StepTemplateComponent, RegistrationStepsComponent, LoginStepsComponent, RegistrationStepTemplateComponent, LoginStepTemplateComponent],
  imports: [
    CommonModule,
    MenuRoutingModule,
    TranslateModule,
    FormsModule,
    SharedPipesModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
  ]
})
export class MenuModule { }
