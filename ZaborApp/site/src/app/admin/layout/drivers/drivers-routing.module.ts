import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DriversComponent } from './drivers.component';
import { ViewComponent } from './view/view.component';

const routes: Routes = [
  {
    path: "list",
    component: DriversComponent
  },
  {
    path: "view/:id",
    component: ViewComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DriversRoutingModule { }
