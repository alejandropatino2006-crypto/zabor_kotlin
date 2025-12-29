import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminRestaurantsComponent } from './restaurants.component';
import { ViewComponent } from './view/view.component';
import { ReviewComponent } from './review/review.component';
import { GalleryComponent } from './gallery/gallery.component';
import { MenuComponent } from './menu/menu.component';
import { OrdersComponent } from './orders/orders.component';

const routes: Routes = [
    {
        path: '', children: [
            {
                path: 'list',
                component: AdminRestaurantsComponent,
                data: {
                    title: 'Restaurant'
                }
            },
            {
                path: 'view/:id',
                component: ViewComponent,
                data: {
                    title: 'View Restaurant'
                }
            },
            {
                path: 'review/:id',
                component: ReviewComponent,
                data: {
                    title: 'Restaurant Review'
                }
            },
            {
                path: 'gallery/:id',
                component: GalleryComponent,
                data: {
                    title: 'Gallery'
                }
            },
            {
                path: 'menu/:id',
                component: MenuComponent,
                data: {
                    title: 'Menu'
                }
            },
            {
                path: 'orders/:id',
                component: OrdersComponent,
                data: {
                    title: 'Detail'
                }
            },
        ]
    },
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class restaurantsRoutingModule {
}
