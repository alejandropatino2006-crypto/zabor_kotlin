import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DriverComponent } from './driver.component';
import { ViewComponent } from './view/view.component';

const routes: Routes = [
  {
    path: '',
    component: DriverComponent,
    data: {
      title: 'Driver Request'
    }
  },
  {
    path: 'view/:id',
    component: ViewComponent,
    data: {
      title: 'Driver Request'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriverRoutingModule { }
