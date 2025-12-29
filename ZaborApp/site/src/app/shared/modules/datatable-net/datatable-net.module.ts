import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DatatablesNetTableComponent } from './datatables-net-table/datatables-net-table.component';
import { DataTablesModule } from 'angular-datatables';
import { TranslateModule } from '@ngx-translate/core';



@NgModule({
  declarations: [DatatablesNetTableComponent],
  exports: [DatatablesNetTableComponent],
  imports: [
    CommonModule,
    DataTablesModule,
    TranslateModule
  ]
})
export class DatatableNetModule { }
