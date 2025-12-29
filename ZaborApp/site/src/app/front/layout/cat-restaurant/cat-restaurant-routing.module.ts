import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CatRestaurantComponent } from './cat-restaurant.component';

const routes: Routes = [
  {
    path: '',
    component: CatRestaurantComponent,
    data: {
      title: 'Restaurant',
      breadcrumb: 'Category Restaurants'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CatRestaurantRoutingModule { }
