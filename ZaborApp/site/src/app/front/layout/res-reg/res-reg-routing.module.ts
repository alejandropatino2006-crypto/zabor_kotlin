import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ResRegComponent } from './res-reg.component';

const routes: Routes = [
  {
    path: '',
    component: ResRegComponent,
    data: {
      title: 'Restaurant Registration',
      breadcrumb: 'Restaurant Reg'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ResRegRoutingModule { }
