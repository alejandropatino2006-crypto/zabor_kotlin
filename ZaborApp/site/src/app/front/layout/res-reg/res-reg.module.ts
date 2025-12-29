import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from "@ngx-translate/core";
import { ResRegRoutingModule } from './res-reg-routing.module';
import { ResRegComponent } from './res-reg.component';
import { ReactiveFormsModule } from '@angular/forms';
@NgModule({
  declarations: [ResRegComponent],
  imports: [
    CommonModule,
    ResRegRoutingModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    TranslateModule
  ]
})
export class ResRegModule { }
