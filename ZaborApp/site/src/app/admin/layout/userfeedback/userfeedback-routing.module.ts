import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { UserfeedbackComponent } from './userfeedback.component';

const routes: Routes = [
    {
        path: '', component: UserfeedbackComponent, data: {
            title: 'Users Feedback'
        }
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class UserfeedbackRoutingModule {
}
