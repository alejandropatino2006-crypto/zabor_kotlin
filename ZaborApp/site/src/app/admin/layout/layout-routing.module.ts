import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';

const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', redirectTo: 'dashboard', pathMatch: 'prefix' },
            { path: 'dashboard', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule) },
            { path: 'profile', loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule) },
            { path: 'user', loadChildren: () => import('./user/user.module').then(m => m.UserModule) },
            { path: 'static-pages', loadChildren: () => import('./staticpages/staticpages.module').then(m => m.StaticpagesModule) },
            { path: 'category', loadChildren: () => import('./category/category.module').then(m => m.CategoryModule) },
            { path: 'subcategory', loadChildren: () => import('./subcategory/subcategory.module').then(m => m.SubcategoryModule) },
            { path: 'restaurant', loadChildren: () => import('./restaurant/restaurants.module').then(m => m.RestaurantModule) },
            { path: 'user-feedback', loadChildren: () => import('./userfeedback/userfeedback.module').then(m => m.UserfeedbackModule) },
            { path: 'category-suggestion', loadChildren: () => import('./category-suggestion/category-suggestion.module').then(m => m.CategorySuggestionModule) },
            { path: 'promotionals', loadChildren: () => import('./promotional/promotional.module').then(m => m.PromotionalModule) },
            { path: 'setting', loadChildren: () => import('./setting/setting.module').then(m => m.SettingModule) },
            { path: 'faq', loadChildren: () => import('./faq/faq.module').then(m => m.FaqModule) },
            { path: 'orders', loadChildren: () => import('./orders/orders.module').then(m => m.OrdersModule) },
            { path: 'driver-reg', loadChildren: () => import('./driver-reg/driver.module').then(m => m.DriverModule) },
            { path: 'res-reg', loadChildren: () => import('./res-reg/res-reg.module').then(m => m.ResRegModule) },
            { path: 'drivers', loadChildren: () => import('./drivers/drivers.module').then(m => m.DriversModule) },
            {
                path: "reservation",
                loadChildren: () =>
                    import("./reservations/reservations.module").then(
                        m => m.ReservationsModule
                    )
            },
            { path: 'terminal', loadChildren: () => import('./terminal/terminal.module').then(m => m.TerminalModule) },
            { path: 'dejavoo', loadChildren: () => import('./dejavoo/dejavoo.module').then(m => m.DejavooModule) },
            { path: 'reports', loadChildren: () => import('./reports/reports.module').then(m => m.ReportsModule) },
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule { }
