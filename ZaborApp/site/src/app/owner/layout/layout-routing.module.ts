import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { LayoutComponent } from "./layout.component";
import { OwnersOrdersModule } from './orders/orders.module';

const routes: Routes = [
  {
    path: "",
    component: LayoutComponent,
    children: [
      { path: "", redirectTo: "dashboard", pathMatch: "prefix" },
      { path: "dashboard", loadChildren: () => import("./dashboard/dashboard.module").then(m => m.DashboardModule) },
      {
        path: "profile",
        loadChildren: () => import("./profile/profile.module").then(m => m.ProfileModule)
      },
      {
        path: "restaurants",
        loadChildren: () => import("./restaurant/restaurants.module").then(m => m.RestaurantModule)
      },
      {
        path: "promotionals",
        loadChildren: () => import("./promotional/promotional.module").then(m => m.PromotionalModule)
      },
      {
        path: "orders",
        loadChildren: () => import("./orders/orders.module").then(m => m.OwnersOrdersModule)
      },
      {
        path: "reservation",
        loadChildren: () => import("./reservations/reservations.module").then(m => m.ReservationsModule)
      },
      {
        path: "editors",
        loadChildren: () => import("./editor/editor.module").then(m => m.EditorModule)
      },
      {
        path: "reports",
        loadChildren: () => import("./reports/reports.module").then(m => m.ReportsModule)
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class LayoutRoutingModule { }
