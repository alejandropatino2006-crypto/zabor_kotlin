import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SearchbannerComponent } from './searchbanner.component';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from "@ngx-translate/core";

@NgModule({
  declarations: [SearchbannerComponent],
  imports: [
    CommonModule,
    FormsModule,
    RouterModule,
    TranslateModule
  ],
  exports: [SearchbannerComponent]
})
export class SearchbannerModule { }
