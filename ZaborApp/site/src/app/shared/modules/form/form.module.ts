import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TrLabelComponent } from './tr-label/tr-label.component';
import { ImgFallbackDirective } from './img-fallback.directive';



@NgModule({
  declarations: [TrLabelComponent, ImgFallbackDirective],
  exports: [
    TrLabelComponent,
    ImgFallbackDirective
  ],
  imports: [
    CommonModule
  ]
})
export class FormModule { }
