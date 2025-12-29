import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ResRegComponent } from './res-reg.component';
import { ViewComponent } from './view/view.component';

const routes: Routes = [
  {
    path: '',
    component: ResRegComponent,
    data: {
      title: 'Restaurant Registration'
    }
  },
  {
    path: 'view/:id',
    component: ViewComponent,
    data: {
      title: 'View'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResRegRoutingModule { }
