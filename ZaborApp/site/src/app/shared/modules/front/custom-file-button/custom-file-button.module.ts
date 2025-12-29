import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CustomFileButtonComponent } from './custom-file-button.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [CustomFileButtonComponent],
  imports: [
    CommonModule,
    TranslateModule
  ],
  exports: [CustomFileButtonComponent]
})
export class CustomFileButtonModule { }
