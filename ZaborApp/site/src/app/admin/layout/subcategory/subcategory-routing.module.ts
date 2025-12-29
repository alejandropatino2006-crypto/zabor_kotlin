import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SubcategoryComponent } from './subcategory.component';

const routes: Routes = [
    {
        path: '', component: SubcategoryComponent, data: {
            title: 'Subcategory'
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class SubcategoryRoutingModule {
}
