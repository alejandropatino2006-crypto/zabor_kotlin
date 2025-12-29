import { CommonModule } from "@angular/common";
import { HttpClientModule, HTTP_INTERCEPTORS } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { LanguageTranslationModule } from "./shared/modules/language-translation/language-translation.module";
import { NgxSpinnerModule } from "ngx-spinner";

import { ToastrModule } from 'ngx-toastr';
import { ImageCropperModule } from 'ngx-image-cropper';
import { JwtInterceptor } from './shared/helpers/jwt.interceptor';
import { ErrorInterceptor } from './shared/helpers/error.interceptor';
import { NotFoundComponentComponent } from './not-found-component/not-found-component.component';
import { NgMultiSelectDropDownModule } from 'ng-multiselect-dropdown';
import { DataTablesModule } from 'angular-datatables';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AngularFireModule } from '@angular/fire';
import { AngularFireAuthModule } from '@angular/fire/auth';
import { AngularFireMessagingModule } from '@angular/fire/messaging';
import { ServiceWorkerModule } from '@angular/service-worker';

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { OwnerAuthGuard, UserAuthGuard, AdminAuthGuard, EmployeeAuthGuard } from "./shared";

import { LoginGuard } from "./shared";
import { AdminComponent } from "./admin/admin.component";
import { UserComponent } from "./owner/user.component";
import { SharedComponent } from "./shared/shared.component";

import { environment } from '../environments/environment';

@NgModule({
    imports: [
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        LanguageTranslationModule,
        AppRoutingModule,
        NgxSpinnerModule,
        ToastrModule.forRoot(),
        ImageCropperModule,
        NgMultiSelectDropDownModule.forRoot(),
        DataTablesModule,
        // ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.usingFirebaseAuth, registrationStrategy: 'registerImmediately' }),
        // ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.usingFirebaseAuth, registrationStrategy: 'registerWhenStable:30000' }),
        // ServiceWorkerModule.register('combined-sw.js', { enabled: environment.production && environment.usingFirebaseAuth, registrationStrategy: 'registerWhenStable:30000' }),
        AngularFireModule.initializeApp(environment.firebase),
        AngularFireAuthModule,
        AngularFireMessagingModule,
        NgbModule,
    ],
    declarations: [
        AppComponent,
        AdminComponent,
        UserComponent,
        SharedComponent,
        NotFoundComponentComponent,
    ],
    providers: [
      AdminAuthGuard, OwnerAuthGuard, EmployeeAuthGuard, UserAuthGuard, LoginGuard,
      { provide: HTTP_INTERCEPTORS, useClass: JwtInterceptor, multi: true },
      { provide: HTTP_INTERCEPTORS, useClass: ErrorInterceptor, multi: true }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
