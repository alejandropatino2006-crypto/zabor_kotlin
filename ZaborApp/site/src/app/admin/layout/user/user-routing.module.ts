import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ListComponent } from './list/list.component';
import { EditComponent } from './edit/edit.component';

const routes: Routes = [
    {
        path: '', children: [
            {
                path: 'list',
                component: ListComponent,
                data: {
                    title: 'Users'
                }
            },
            {
                path: 'view/:id',
                component: EditComponent,
                data: {
                    title: 'View users'
                }
            }
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserRoutingModule {
}
