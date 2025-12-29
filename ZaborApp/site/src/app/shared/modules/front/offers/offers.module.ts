import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OffersComponent } from './offers.component';
import { TranslateModule } from '@ngx-translate/core';
import { SharedPipesModule } from 'src/app/shared';

@NgModule({
  declarations: [OffersComponent],
  imports: [
    CommonModule,
    TranslateModule,
    SharedPipesModule
  ],
  exports: [OffersComponent]
})
export class OffersModule { }
