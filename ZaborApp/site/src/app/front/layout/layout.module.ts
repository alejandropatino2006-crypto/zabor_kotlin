import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NgbDropdownModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from "@ngx-translate/core";

import { LayoutRoutingModule } from './layout-routing.module';
import { LayoutComponent } from './layout.component';
import { HeaderComponent } from './components/header/header.component';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { FooterComponent } from './components/footer/footer.component';
import { LangChangeModule } from 'src/app/shared/modules/front/lang-change/lang-change.module';
import { FormModule } from '../../shared/modules/form/form.module';


@NgModule({
    imports: [
        CommonModule,
        LayoutRoutingModule,
        TranslateModule,
        NgbDropdownModule,
        ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
        LangChangeModule,
        FormsModule,
        FormModule,
    ],
    declarations: [LayoutComponent, FooterComponent, HeaderComponent]
})
export class LayoutModule { }
