import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SafePipe } from './safe-pipe.pipe';
import { TimeformateChange } from './timeformate-change.pipe';
import { GetDateFormated } from './getDateFormated.pipe';
import { GetOpenHoursPipe } from './get-open-hours.pipe';
import { AvgcostPipe } from './avgcost.pipe';
import { GetCus } from './menu.pipe'

@NgModule({
    imports: [
        CommonModule
    ],
    exports: [SafePipe, TimeformateChange, GetDateFormated, GetOpenHoursPipe, AvgcostPipe, GetCus],
    declarations: [SafePipe, TimeformateChange, GetDateFormated, GetOpenHoursPipe, AvgcostPipe, GetCus]
})
export class SharedPipesModule { }
