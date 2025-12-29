import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CategorySuggestionComponent } from './category-suggestion.component';

const routes: Routes = [
  {
    path: '', component: CategorySuggestionComponent, data: {
      title: 'Users Feedback'
    }
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class CategorySuggestionRoutingModule { }
