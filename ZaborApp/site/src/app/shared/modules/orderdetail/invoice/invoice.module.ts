import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InvoiceComponent } from './invoice.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [InvoiceComponent],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [InvoiceComponent]
})
export class InvoiceModule { }
