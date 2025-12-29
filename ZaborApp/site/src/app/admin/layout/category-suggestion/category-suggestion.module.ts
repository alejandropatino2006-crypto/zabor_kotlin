import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataTablesModule } from 'angular-datatables';
import { CategorySuggestionRoutingModule } from './category-suggestion-routing.module';
import { CategorySuggestionComponent } from './category-suggestion.component';

@NgModule({
  declarations: [CategorySuggestionComponent],
  imports: [
    CommonModule,
    CategorySuggestionRoutingModule,
    DataTablesModule
  ]
})
export class CategorySuggestionModule { }
