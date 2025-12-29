import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdvertComponent } from './advert/advert.component';
import { VideoComponent } from './video/video.component';

const routes: Routes = [
  {
    path: '', children: [
      {
        path: 'advert',
        component: AdvertComponent,
        data: {
          title: 'Promotional Advert'
        }
      },
      {
        path: 'video',
        component: VideoComponent,
        data: {
          title: 'Promotional Video'
        }
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class PromotionalRoutingModule { }
