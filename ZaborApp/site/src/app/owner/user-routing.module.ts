import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { OwnerAuthGuard } from "../shared";
import { LoginGuard } from "../shared";
import {ActiveOwnerComponent} from './activeowner/activeowner.component';

const routes: Routes = [
  // { path: '', loadChildren: () => import('./layout/layout.module').then(m => m.LayoutModule) },
  {
    path: "",
    loadChildren: () =>
      import("./layout/layout.module").then(m => m.LayoutModule),
    canActivate: [OwnerAuthGuard]
  },
  {
    path: "login",
    loadChildren: () => import("./login/login.module").then(m => m.LoginModule),
    canActivate: [LoginGuard]
  },
  {
    path: "signup",
    loadChildren: () =>
      import("./signup/signup.module").then(m => m.SignupModule),
    canActivate: [LoginGuard]
  },
  {
    path: "forget-password",
    loadChildren: () =>
      import("./forget-password/forget-password.module").then(
        m => m.ForgetPasswordModule
      ),
    canActivate: [LoginGuard]
  },
  {
    path: 'activeowner',
    component: ActiveOwnerComponent, canActivate: [LoginGuard]
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class UserRoutingModule { }
