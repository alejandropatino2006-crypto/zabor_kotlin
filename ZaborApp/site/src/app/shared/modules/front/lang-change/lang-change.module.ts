import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LangChangeComponent } from './lang-change.component';

@NgModule({
  declarations: [LangChangeComponent],
  imports: [
    CommonModule
  ],
  exports: [LangChangeComponent]
})
export class LangChangeModule { }
