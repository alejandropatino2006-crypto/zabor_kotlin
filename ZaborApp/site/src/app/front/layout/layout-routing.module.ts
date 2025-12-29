import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LayoutComponent } from './layout.component';
import { UserAuthGuard } from 'src/app/shared';


const routes: Routes = [
    {
        path: '',
        component: LayoutComponent,
        children: [
            { path: '', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) },
            { path: 'pages/:id', loadChildren: () => import('./pages/pages.module').then(m => m.PagesModule) },
            { path: 'restaurants', loadChildren: () => import('./restaurants/restaurants.module').then(m => m.RestaurantsModule) },
            { path: 'catres/:id', loadChildren: () => import('./cat-restaurant/cat-restaurant.module').then(m => m.CatRestaurantModule) },
            { path: 'restaurant/:id', loadChildren: () => import('./restaurant-detail/restaurant-detail.module').then(m => m.RestaurantDetailModule) },
            { path: 'menu/:id', loadChildren: () => import('./menu/menu.module').then(m => m.MenuModule) },
            { path: 'allrestaurant/:id', loadChildren: () => import('./allrestaurant/allrestaurant.module').then(m => m.AllrestaurantModule) },
            { path: 'contactus', loadChildren: () => import('./contact/contact.module').then(m => m.ContactModule) },
            { path: 'dashboard/:id', loadChildren: () => import('./dashboard/dashboard.module').then(m => m.DashboardModule), canActivate: [UserAuthGuard] },
            { path: 'allreview/:id', loadChildren: () => import('./allreview/allreview.module').then(m => m.AllreviewModule) },
            { path: 'gallery/:id', loadChildren: () => import('./gallery/gallery.module').then(m => m.GalleryModule) },
            { path: 'claim/:id', loadChildren: () => import('./claim/claim.module').then(m => m.ClaimModule) },
            { path: 'checkout', loadChildren: () => import('./checkout/checkout.module').then(m => m.CheckoutModule) },
            { path: 'faq', loadChildren: () => import('./faq/faq.module').then(m => m.FaqModule) },
            { path: 'driver-reg', loadChildren: () => import('./driver-reg/driver-reg.module').then(m => m.DriverRegModule) },
            { path: 'res-reg', loadChildren: () => import('./res-reg/res-reg.module').then(m => m.ResRegModule) },
            { path: 'order/:id/:order_hash', loadChildren: () => import('./order/order.module').then(m => m.OrderModule) },
            { path: 'offers', loadChildren: () => import('./offers/offers.module').then(m => m.OffersModule) }
        ]
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class LayoutRoutingModule { }
