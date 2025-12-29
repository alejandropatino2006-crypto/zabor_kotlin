import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { EmployeeAuthGuard } from '../shared/guard/employee.auth.guard';
import { LoginGuard } from "../shared";
import { DashboardComponent } from './dashboard/dashboard.component';

const routes: Routes = [
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
    path: "dashboard",
    component: DashboardComponent,
    canActivate: [EmployeeAuthGuard]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class EmployeeRoutingModule { }
