import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ResetpasswordComponent } from "./resetpassword/resetpassword.component";
import { ActiveuserComponent } from './activeuser/activeuser.component';
import { LoginGuard } from "../shared";

const routes: Routes = [
  {
    path: '', children: [
      {
        path: 'login',
        loadChildren: () => import("./login/login.module").then(m => m.LoginModule), canActivate: [LoginGuard]
      },
      {
        path: 'signup',
        loadChildren: () => import("./register/register.module").then(m => m.RegisterModule), canActivate: [LoginGuard]
      },
      {
        path: 'forget-password',
        loadChildren: () => import("./forget-password/forget-password.module").then(m => m.ForgetPasswordModule), canActivate: [LoginGuard]
      },
      {
        path: 'resetpassword',
        component: ResetpasswordComponent,
        canActivate: [LoginGuard]
      },
      {
        path: 'activeuser',
        component: ActiveuserComponent, canActivate: [LoginGuard]
      },
      {
        path: '',
        loadChildren: () => import("./layout/layout.module").then(m => m.LayoutModule),
      },
      {
        path: 'terminalTest',
        loadChildren: () => import("./terminal/terminal.module").then(m => m.TerminalModule)
      },
    ]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class FrontRoutingModule { }
