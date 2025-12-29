import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { NotFoundComponentComponent } from "./not-found-component/not-found-component.component";
import { AppComponent } from './app.component';

const routes: Routes = [
  {
    path: "", loadChildren: () => import("./front/front.module").then(m => m.FrontModule)
  },
  {
    path: "owner",
    loadChildren: () => import("./owner/user.module").then(m => m.UserModule)
  },
  {
    path: "admin",
    loadChildren: () => import("./admin/admin.module").then(m => m.AdminModule)
  },
  {
    path: "pos",
    loadChildren: () => import("./employee/employee.module").then(m => m.EmployeeModule)
  },
  {
    path: "front",
    loadChildren: () => import("./front/front.module").then(m => m.FrontModule),
  },
  {
    path: "**",
    component: NotFoundComponentComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { enableTracing: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
