import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {AuthenticationService} from '../services/authentication.service';
import {ClientStorageService} from '../services/client-storage.service';

@Injectable()
export class AdminAuthGuard implements CanActivate {

    constructor(private router: Router, private Auth: AuthenticationService, private clientStorage: ClientStorageService) { }

    // canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    //     if (localStorage.getItem('token') && localStorage.getItem('currentuser')) {
    //         //check if logged in user admin
    //         if (JSON.parse(localStorage.getItem('currentuser')).user.role == "admin")
    //             return true;
    //         else
    //             this.router.navigate(['/'])
    //     }
    //     this.router.navigate(['/admin/login']);
    //     return false;
    // }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        if (this.clientStorage.retrieveToken() != null && localStorage.getItem('currentuser') != null) {
            const loggedInUserRole = JSON.parse(localStorage.getItem('currentuser')).user.role;
            if (loggedInUserRole === "admin") {
                return true;
            }
        }

        this.Auth.logout("admin");
        return false;
    }

}
