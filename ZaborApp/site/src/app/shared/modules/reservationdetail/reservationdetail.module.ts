import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReservationdetailComponent } from './reservationdetail.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [ReservationdetailComponent],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [ReservationdetailComponent]
})
export class ReservationdetailModule { }
