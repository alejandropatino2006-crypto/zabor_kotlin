import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { OwnerRestaurantsComponent } from './restaurants.component';
import { EditComponent } from './edit/edit.component';
import { CreateComponent } from './create/create.component';
import { MenuComponent } from './menu/menu.component';
import { ReviewComponent } from './review/review.component';
import { GalleryComponent } from './gallery/gallery.component';
import { DetailComponent } from './detail/detail.component';
import { ReservationTimeComponent } from './reservation-time/reservation-time.component';
import { OrdersComponent } from './orders/orders.component';
import { DiscountComponent } from './discount/discount.component';
import { TablecreateComponent } from './table/tablecreate/tablecreate.component';
import { TablelistComponent } from './table/tablelist/tablelist.component';
import { TableeditComponent } from './table/tableedit/tableedit.component';
import { InventoryComponent } from './inventory/inventory.component';
import { CreateInventoryComponent } from './inventory/create-inventory/create-inventory.component';
import { EditInventoryComponent } from './inventory/edit-inventory/edit-inventory.component';
import { ViewInventoryComponent } from './inventory/view-inventory/view-inventory.component';
import { CreateEmployeeComponent } from './employees/create-employee/create-employee.component';
import { EmployeesComponent } from './employees/employees.component';
import { EditEmployeeComponent } from './employees/edit-employee/edit-employee.component';
import { ViewEmployeeComponent } from './employees/view-employee/view-employee.component';
import { CustomersComponent } from './customer/customers.component';
import { ViewCustomerComponent } from './customer/view-customer/view-customer.component';
import { CreateCustomerComponent } from './customer/create-customer/create-customer.component';
import { EditCustomerComponent } from './customer/edit-customer/edit-customer.component';
import { MenuRetailComponent } from './menu-retail/menu-retail.component';

const routes: Routes = [
    {
        path: '', children: [
            {
                path: 'list',
                component: OwnerRestaurantsComponent,
                data: {
                    title: 'Restaurant'
                }
            },
            {
                path: 'create',
                component: CreateComponent,
                data: {
                    title: 'Create Restaurant'
                }
            },
            {
                path: 'table/create',
                component: TablecreateComponent,
                data: {
                    title: 'Table Create Restaurant'
                }
            },
            {
                path: 'table/list/:restid/:restname',
                component: TablelistComponent,
                data: {
                    title: 'Table List Restaurant'
                }
            },
            {
                path: 'table/edit',
                component: TableeditComponent,
                data: {
                    title: 'Table Edit Restaurant'
                }
            },
            {
                path: 'edit/:id',
                component: EditComponent,
                data: {
                    title: 'Edit Restaurant'
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
                path: 'menu-retail/:id',
                component: MenuRetailComponent,
                data: {
                    title: 'Menu'
                }
            },
            {
                path: 'review/:id',
                component: ReviewComponent,
                data: {
                    title: 'Review'
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
                path: 'detail/:id',
                component: DetailComponent,
                data: {
                    title: 'Detail'
                }
            },
            {
                path: 'orders/:id',
                component: OrdersComponent,
                data: {
                    title: 'Detail'
                }
            },
            {
                path: 'reservation-time/:id',
                component: ReservationTimeComponent,
                data: {
                    title: 'Reservation Time'
                }
            },
            {
                path: 'discounts/:id',
                component: DiscountComponent,
                data: {
                    title: 'Discounts'
                }
            },
            {
                path: 'inventory/:restid',
                component: InventoryComponent,
                data: {
                    title: 'Inventory'
                }
            },
            {
                path: 'inventory/create/:restid',
                component: CreateInventoryComponent,
                data: {
                    title: 'Create Inventory'
                }
            },
            {
                path: 'inventory/edit/:id/:restid',
                component: EditInventoryComponent,
                data: {
                    title: 'Edit Inventory'
                }
            },
            {
                path: 'inventory/view/:id/:restid',
                component: ViewInventoryComponent,
                data: {
                    title: 'View Inventory'
                }
            },
            {
                path: 'employee/:restid',
                component: EmployeesComponent,
                data: {
                    title: 'Employees'
                }
            },
            {
                path: 'employee/create/:restid',
                component: CreateEmployeeComponent,
                data: {
                    title: 'Create Inventory'
                }
            },
            {
                path: 'employee/edit/:id/:restid',
                component: EditEmployeeComponent,
                data: {
                    title: 'Edit Inventory'
                }
            },
            {
                path: 'employee/view/:id/:restid',
                component: ViewEmployeeComponent,
                data: {
                    title: 'View Inventory'
                }
            },
            {
                path: 'customer/:restid',
                component: CustomersComponent,
                data: {
                    title: 'customers'
                }
            },
            {
                path: 'customer/create/:restid',
                component: CreateCustomerComponent,
                data: {
                    title: 'Create Customers'
                }
            },
            {
                path: 'customer/edit/:id/:restid',
                component: EditCustomerComponent,
                data: {
                    title: 'Edit customers'
                }
            },
            {
                path: 'customer/view/:id/:restid',
                component: ViewCustomerComponent,
                data: {
                    title: 'View customers'
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
