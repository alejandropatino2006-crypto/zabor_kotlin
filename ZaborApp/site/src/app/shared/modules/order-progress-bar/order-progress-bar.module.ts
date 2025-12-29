import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrderProgressBarComponent } from './order-progress-bar.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [OrderProgressBarComponent],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [OrderProgressBarComponent]
})
export class OrderProgressBarModule { }
