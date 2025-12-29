import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TerminalComponent } from './terminal.component';
import {PaymentTestComponent} from './payment-test/payment-test.component';
import {AutoLoginComponent} from './auto-login/auto-login.component';

const routes: Routes = [
  {
    path: '',
    component: AutoLoginComponent,
    data: {
        title: 'Stripe Terminal'
    }
  },
  {
    path: 'test',
    component: TerminalComponent,
    data: {
        title: 'Stripe Terminal'
    }
  },
  {
    path: 'paymentTest',
    component: PaymentTestComponent,
    data: {
        title: 'Payment Testing'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TerminalRoutingModule { }
