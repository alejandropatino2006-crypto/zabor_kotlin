import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ClaimComponent } from './claim.component';

const routes: Routes = [
  {
    path: '',
    component: ClaimComponent,
    data: {
      title: 'Claim',
      breadcrumb: 'Clai'
    }
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ClaimRoutingModule { }
