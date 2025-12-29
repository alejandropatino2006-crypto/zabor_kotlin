import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import {SalesReportComponent} from './components';
import { AllSalesByShiftAndDateComponent } from './components/all-sales-by-shift-and-date/all-sales-by-shift-and-date.component';
import { BestSalesByItemComponent } from './components/best-sales-by-item/best-sales-by-item.component';
import { PayoutsComponent } from './components/payouts/payouts.component';
import { ReturnsComponent } from './components/returns/returns.component';
import { SalesByBartagComponent } from './components/sales-by-bartag/sales-by-bartag.component';
import { SalesByDeliveryComponent } from './components/sales-by-delivery/sales-by-delivery.component';
import { SalesByDineinComponent } from './components/sales-by-dinein/sales-by-dinein.component';
import { SalesByEmployeeComponent } from './components/sales-by-employee/sales-by-employee.component';
import { SalesByItemComponent } from './components/sales-by-item/sales-by-item.component';
import { SalesByKioskComponent } from './components/sales-by-kiosk/sales-by-kiosk.component';
import { SalesByTakeoutComponent } from './components/sales-by-takeout/sales-by-takeout.component';
import { SalesDashboardComponent } from './components/sales-dashboard.component';
import { SalesForMenuGroupComponent } from './components/sales-for-menu-group/sales-for-menu-group.component';
import { SummarySalesByMenuGroupComponent } from './components/summary-sales-by-menu-group/summary-sales-by-menu-group.component';
import { SummarySalesByShiftComponent } from './components/summary-sales-by-shift/summary-sales-by-shift.component';
import { TotalSalesByShiftComponent } from './components/total-sales-by-shift/total-sales-by-shift.component';

const routes: Routes = [
    {
        path: 'report', component: SalesReportComponent, data: {
            title: 'Sales Report'
        }
    },
    {
        path: '', component: SalesDashboardComponent, data: {
            title: 'Sales Dashboard'
        }
    },
    {
        path: 'all-sales-by-shift-and-date', component: AllSalesByShiftAndDateComponent, data: {
            title: 'All Sales By Shift And Date'
        }
    },
    {
        path: 'sales-by-employees', component: SalesByEmployeeComponent, data: {
            title: 'Sales By Employees'
        }
    },
    {
        path: 'total-sales-by-shifts', component: TotalSalesByShiftComponent, data: {
            title: 'Total Sales By Shifts'
        }
    },
    {
        path: 'summary-sales-by-shift', component: SummarySalesByShiftComponent, data: {
            title: 'Summary Sales By Shift'
        }
    },
    {
        path: 'sales-by-items', component: SalesByItemComponent, data: {
            title: 'Sales By Items'
        }
    },
    {
        path: 'best-sales-items', component: BestSalesByItemComponent, data: {
            title: 'Best Sales Items'
        }
    },
    {
        path: 'sales-for-menu-group', component: SalesForMenuGroupComponent, data: {
            title: 'Sales For Menu Group'
        }
    },
    {
        path: 'sales-by-delivery', component: SalesByDeliveryComponent, data: {
            title: 'Sales By Delivery'
        }
    },
    {
        path: 'sales-by-takeout', component: SalesByTakeoutComponent, data: {
            title: 'Sales By Takeout'
        }
    },
    {
        path: 'sales-by-dinein', component: SalesByDineinComponent, data: {
            title: 'Sales By Dine In'
        }
    },
    {
        path: 'sales-by-bartag', component: SalesByBartagComponent, data: {
            title: 'Sales By Bar Tag'
        }
    },
    {
        path: 'payout', component: PayoutsComponent, data: {
            title: 'Payouts'
        }
    },
    {
        path: 'return', component: ReturnsComponent, data: {
            title: 'Returns'
        }
    },
    {
        path: 'summary-sales-by-menu-group', component: SummarySalesByMenuGroupComponent, data: {
            title: 'Summary Sales By Menu Group'
        }
    },
    {
        path: 'sales-by-kiosk', component: SalesByKioskComponent, data: {
            title: 'Sales By Kiosk'
        }
    }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class ReportsRoutingModule {
}
