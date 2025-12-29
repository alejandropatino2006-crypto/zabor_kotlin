import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationsRoutingModule } from './reservations-routing.module';
import { ReservationsComponent } from './reservations.component';
import { DataTablesModule } from 'angular-datatables';
import { DetailComponent } from './detail/detail.component';
import { ReservationdetailModule } from './../../../shared/modules/reservationdetail/reservationdetail.module';

@NgModule({
  declarations: [ReservationsComponent, DetailComponent],
  imports: [
    CommonModule,
    ReservationsRoutingModule,
    DataTablesModule,
    ReservationdetailModule
  ]
})
export class ReservationsModule { }
