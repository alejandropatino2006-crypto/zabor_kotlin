import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
    data: {
      title: 'Home',
      breadcrumb: 'Reviews'
    }
  },
  {
    path: 'home',
    redirectTo: ''
  },
  {
    path: 'main',
    redirectTo: ''
  },
  {
    path: 'default',
    redirectTo: ''
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomeRoutingModule { }
