import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ReservationsComponent } from './reservations.component';
import { DetailComponent } from './detail/detail.component'

const routes: Routes = [
  {
    path: '',
    component: ReservationsComponent,
    data: {
      title: 'Reservation'
    }
  },
  {
    path: 'detail/:id',
    component: DetailComponent,
    data: {
      title: 'Detail'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReservationsRoutingModule { }
