import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AllreviewComponent } from './allreview.component';

const routes: Routes = [
  {
    path: '',
    component: AllreviewComponent,
    data: {
      title: 'Reviews',
      breadcrumb: 'Reviews'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AllreviewRoutingModule { }
