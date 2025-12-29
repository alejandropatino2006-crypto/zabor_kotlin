import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TerminalRoutingModule } from './terminal-routing.module';
import { TerminalComponent } from './terminal.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { PaymentTestComponent } from './payment-test/payment-test.component';
import { DataTablesModule } from 'angular-datatables';
import { LocationsComponent } from './locations/locations.component';
import { ReadersComponent } from './readers/readers.component';
import { AccountsComponent } from './accounts/accounts.component';
import { CreateReaderComponent } from './readers/create-reader/create-reader.component';
import { EditReaderComponent } from './readers/edit-reader/edit-reader.component';
import { ViewReaderComponent } from './readers/view-reader/view-reader.component';
import { CreateAccountComponent } from './accounts/create-account/create-account.component';
import { EditAccountComponent } from './accounts/edit-account/edit-account.component';
import { ViewAccountComponent } from './accounts/view-account/view-account.component';
import { CreateLocationComponent } from './locations/create-location/create-location.component';
import { EditLocationComponent } from './locations/edit-location/edit-location.component';
import { ViewLocationComponent } from './locations/view-location/view-location.component';

@NgModule({
  // tslint:disable-next-line:max-line-length
  declarations: [TerminalComponent, PaymentTestComponent, LocationsComponent, ReadersComponent, AccountsComponent, CreateReaderComponent, EditReaderComponent, ViewReaderComponent, CreateAccountComponent, EditAccountComponent, ViewAccountComponent, CreateLocationComponent, EditLocationComponent, ViewLocationComponent],
  imports: [
    CommonModule,
    DataTablesModule,
    TerminalRoutingModule,
    ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
    FormsModule,
  ]
})
export class TerminalModule { }
