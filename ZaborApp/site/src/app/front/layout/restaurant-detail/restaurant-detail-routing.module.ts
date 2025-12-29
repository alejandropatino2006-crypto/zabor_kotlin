import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RestaurantDetailComponent } from './restaurant-detail.component';

const routes: Routes = [
  {
    path: '',
    component: RestaurantDetailComponent,
    data: {
      title: 'Restaurant Detail',
      breadcrumb: 'Restaurant Details'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class RestaurantDetailRoutingModule { }
