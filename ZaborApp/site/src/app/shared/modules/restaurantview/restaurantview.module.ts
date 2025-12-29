import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RestaurantviewComponent } from './restaurantview.component';
import { Routes, RouterModule } from '@angular/router';
import { AgmCoreModule } from '@agm/core';
import { environment } from 'src/environments/environment';
import { SharedPipesModule } from '../../pipes/shared-pipes.module';
import { FormsModule } from '@angular/forms';
import { UiSwitchModule } from 'ngx-ui-switch';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [
        CommonModule, SharedPipesModule, UiSwitchModule, FormsModule, RouterModule,
        AgmCoreModule.forRoot({
            apiKey: environment.GoogleMapApiKey
        }),
        TranslateModule,
    ],
    declarations: [RestaurantviewComponent],
    exports: [RestaurantviewComponent]
})
export class RestaurantviewModule { }
