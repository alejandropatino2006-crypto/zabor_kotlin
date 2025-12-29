import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from "@ngx-translate/core";
import { AllreviewRoutingModule } from './allreview-routing.module';
import { AllreviewComponent } from './allreview.component';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { SharedPipesModule } from 'src/app/shared';
import { RatingModule } from 'ng-starrating';

@NgModule({
  declarations: [AllreviewComponent],
  imports: [
    CommonModule,
    AllreviewRoutingModule,
    InfiniteScrollModule,
    SharedPipesModule,
    RatingModule,
    TranslateModule
  ]
})
export class AllreviewModule { }
