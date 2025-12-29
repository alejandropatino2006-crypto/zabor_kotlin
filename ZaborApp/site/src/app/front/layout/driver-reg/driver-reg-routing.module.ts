import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DriverRegComponent } from './driver-reg.component';

const routes: Routes = [
  {
    path: '',
    component: DriverRegComponent,
    data: {
      title: 'Driver Registration',
      breadcrumb: 'Drivers Registrations'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverRegRoutingModule { }
