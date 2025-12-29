import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { DejavooRoutingModule } from './dejavoo-routing.module';
import { DejavooComponent } from './dejavoo.component';
import { CreateTerminalComponent } from './create-terminal/create-terminal.component';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { EditTerminalComponent } from './edit-terminal/edit-terminal.component';

@NgModule({
  declarations: [DejavooComponent, CreateTerminalComponent, EditTerminalComponent],
  imports: [
    CommonModule,
    DataTablesModule,
    DejavooRoutingModule,FormsModule, ReactiveFormsModule
  ]
})
export class DejavooModule { }
