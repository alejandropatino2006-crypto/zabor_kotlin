import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { TerminalComponent } from './terminal.component';
import {PaymentTestComponent} from './payment-test/payment-test.component';
import { LocationsComponent } from './locations/locations.component'
import { ReadersComponent } from './readers/readers.component'
import { CreateAccountComponent } from './accounts/create-account/create-account.component';
import { EditAccountComponent } from './accounts/edit-account/edit-account.component';
import { ViewAccountComponent } from './accounts/view-account/view-account.component';
import { CreateLocationComponent } from './locations/create-location/create-location.component';
import { EditLocationComponent } from './locations/edit-location/edit-location.component';
import { ViewLocationComponent } from './locations/view-location/view-location.component';
import { CreateReaderComponent } from './readers/create-reader/create-reader.component';
import { EditReaderComponent } from './readers/edit-reader/edit-reader.component';
import { ViewReaderComponent } from './readers/view-reader/view-reader.component';

const routes: Routes = [
  {
    path: '',
    component: TerminalComponent,
    data: {
        title: 'Stripe Terminal'
    }
  },
  {
    path: 'test/:type/:readerid/:locationid/:accountid',
    component: PaymentTestComponent,
    data: {
        title: 'Payment Testing'
    }
  },
  {
    path: 'account/create',
    component: CreateAccountComponent,
    data: {
        title: 'Create Stripe Account'
    }
  },
  {
    path: 'account/edit/:accountid',
    component: EditAccountComponent,
    data: {
        title: 'Edit Stripe Account'
    }
  },
  {
    path: 'account/view',
    component: ViewAccountComponent,
    data: {
        title: 'View Stripe Account'
    }
  },
  {
    path: 'location/create/:accountid',
    component: CreateLocationComponent,
    data: {
        title: 'Create Stripe Location'
    }
  },
  {
    path: 'location/edit/:locationid',
    component: EditLocationComponent,
    data: {
        title: 'Edit Stripe Location'
    }
  },
  {
    path: 'location/view',
    component: ViewLocationComponent,
    data: {
        title: 'View Stripe Location'
    }
  },
  {
    path: 'reader/create',
    component: CreateReaderComponent,
    data: {
        title: 'Create Stripe Terminal/Reader'
    }
  },
  {
    path: 'reader/edit/:readerid',
    component: EditReaderComponent,
    data: {
        title: 'Edit Stripe Terminal/Reader'
    }
  },
  {
    path: 'reader/view',
    component: ViewReaderComponent,
    data: {
        title: 'View Stripe Terminal/Reader'
    }
  },
  {
    path: 'location/list/:accountid',
    component: LocationsComponent,
    data: {
        title: 'List of Stripe Locations'
    }
  },
  {
    path: 'reader/list/:accountid/:locationid',
    component: ReadersComponent,
    data: {
        title: 'List of Terminals/Readers'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class TerminalRoutingModule { }
