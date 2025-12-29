import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StatComponent } from './stat.component';
import { Routes, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [CommonModule, RouterModule,TranslateModule],
    declarations: [StatComponent],
    exports: [StatComponent]
})
export class StatModule { }
