import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllrestaurantComponent } from './allrestaurant.component';

const routes: Routes = [
  {
    path: '',
    component: AllrestaurantComponent,
    data: {
      title: 'Restaurant',
      breadcrumb: 'Restaurants'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AllrestaurantRoutingModule { }
