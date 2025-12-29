import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminalRoutingModule } from './terminal-routing.module';
import { TerminalComponent } from './terminal.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { PaymentTestComponent } from './payment-test/payment-test.component';
import { AutoLoginComponent } from './auto-login/auto-login.component';

@NgModule({
  declarations: [TerminalComponent, PaymentTestComponent, AutoLoginComponent],
  imports: [
    CommonModule,
    TerminalRoutingModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    FormsModule,
  ]
})
export class TerminalModule { }
