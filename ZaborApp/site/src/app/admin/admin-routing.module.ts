import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminAuthGuard } from '../shared/guard/admin.auth.guard';
import { LoginGuard } from '../shared';

const routes: Routes = [
    // { path: '', loadChildren: () => import('./layout/layout.module').then(m => m.LayoutModule) },
    { path: '', loadChildren: () => import('./layout/layout.module').then(m => m.LayoutModule), canActivate: [AdminAuthGuard] },
    {
        path: "login",
        loadChildren: () =>
            import("./login/login.module").then(m => m.LoginModule), canActivate: [LoginGuard]
    },

];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class AdminRoutingModule { }
