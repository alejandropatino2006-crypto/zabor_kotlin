import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { restaurantsRoutingModule } from './restaurants-routing.module';
import { OwnerRestaurantsComponent } from './restaurants.component';
import { DataTablesModule } from 'angular-datatables';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';
import { UiSwitchModule } from 'ngx-ui-switch';
import { CreateComponent } from './create/create.component';
import { EditComponent } from './edit/edit.component';
import { AngularMultiSelectModule } from 'angular2-multiselect-dropdown';
// import { AngularMultiSelectModule } from '../../../library/angular2-multiselect-dropdown';
import { MenuComponent } from './menu/menu.component';
import { AgmCoreModule } from '@agm/core';
import { environment } from 'src/environments/environment';
import { AmazingTimePickerModule } from 'src/app/library/atp-library/atp-time-picker.module';
import { ReviewComponent } from './review/review.component';
import { RatingModule } from 'ng-starrating';
import { GalleryComponent } from './gallery/gallery.component';
import { AngularFileUploaderModule } from "angular-file-uploader";
import { LightboxModule } from 'ngx-lightbox';
import { DetailComponent } from './detail/detail.component';
import { RestaurantviewModule } from '../../../shared/modules/restaurantview/restaurantview.module';
import { ReservationTimeComponent } from './reservation-time/reservation-time.component';

import { FullCalendarModule } from '@fullcalendar/angular';
import { OrdersComponent } from './orders/orders.component';
import { SharedFrontOrdersModule } from '../../../shared/modules/front/orders/orders.module';
import { DiscountComponent } from './discount/discount.component';
import { RichTextEditorModule } from '@syncfusion/ej2-angular-richtexteditor';
// import { RichTextEditorAllModule } from '@syncfusion/ej2-angular-richtexteditor';
import {TranslateModule} from '@ngx-translate/core';
import { TablecreateComponent } from './table/tablecreate/tablecreate.component';
import { TablelistComponent } from './table/tablelist/tablelist.component';
import { TableeditComponent } from './table/tableedit/tableedit.component';
import { NgxDaterangepickerMd } from 'ngx-daterangepicker-material';
import { InventoryComponent } from './inventory/inventory.component';
import { CreateInventoryComponent } from './inventory/create-inventory/create-inventory.component';
import { EditInventoryComponent } from './inventory/edit-inventory/edit-inventory.component';
import { ViewInventoryComponent } from './inventory/view-inventory/view-inventory.component';
import { MenuInventoryComponent } from './menu-inventory/menu-inventory.component';
import { EmployeesComponent } from './employees/employees.component';
import { CreateEmployeeComponent } from './employees/create-employee/create-employee.component';
import { EditEmployeeComponent } from './employees/edit-employee/edit-employee.component';
import { ViewEmployeeComponent } from './employees/view-employee/view-employee.component';
import { RouterModule } from '@angular/router';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { FormModule } from '../../../shared/modules/form/form.module';
import { CustomersComponent } from './customer/customers.component';
import { ViewCustomerComponent } from './customer/view-customer/view-customer.component';
import { CreateCustomerComponent } from './customer/create-customer/create-customer.component';
import { EditCustomerComponent } from './customer/edit-customer/edit-customer.component';
import { MenuRetailComponent } from './menu-retail/menu-retail.component';

@NgModule({
    imports: [
        CommonModule,
        AngularFileUploaderModule,
        restaurantsRoutingModule,
        DataTablesModule,
        AmazingTimePickerModule,
        UiSwitchModule,
        FormsModule,
        ReactiveFormsModule.withConfig({warnOnNgModelWithFormControl: 'never'}),
        ImageCropperModule,
        RatingModule,
        AngularMultiSelectModule,
        AgmCoreModule.forRoot({
            apiKey: environment.GoogleMapApiKey,
            libraries: ['places']
        }),
        LightboxModule,
        RestaurantviewModule,
        FullCalendarModule,
        SharedFrontOrdersModule,
        RichTextEditorModule,
        TranslateModule,
        NgxDaterangepickerMd.forRoot(),
        RouterModule,
        NgMultiSelectDropDownModule,
        FormModule
    ],
    // tslint:disable-next-line:max-line-length
    declarations: [OwnerRestaurantsComponent, CreateComponent, EditComponent, MenuComponent, ReviewComponent,
      GalleryComponent, DetailComponent, ReservationTimeComponent, OrdersComponent, DiscountComponent,
      TablecreateComponent, TablelistComponent, TableeditComponent, InventoryComponent, CreateInventoryComponent,
      EditInventoryComponent, ViewInventoryComponent, MenuInventoryComponent, EmployeesComponent, CreateEmployeeComponent,
      EditEmployeeComponent, ViewEmployeeComponent, CustomersComponent, ViewCustomerComponent, CreateCustomerComponent,
      EditCustomerComponent,
      MenuRetailComponent]

})
export class RestaurantModule { }
