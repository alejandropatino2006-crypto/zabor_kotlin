import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import {ClientStorageService} from '../services/client-storage.service';

@Injectable()
export class OwnerAuthGuard implements CanActivate {

    constructor(private router: Router, private Auth: AuthenticationService, private clientStorage: ClientStorageService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        // if (sessionStorage.getItem('token') && localStorage.getItem('currentuser') && JSON.parse(localStorage.getItem('currentuser')).user.role == "owner") {
        //     return true;
        // } else {
        //     this.Auth.logout();
        //     this.router.navigate(['/login']);
        //     return false;
        // }

        if (this.clientStorage.retrieveToken() != null && localStorage.getItem('currentuser') != null) {
            const loggedInUserRole = JSON.parse(localStorage.getItem('currentuser')).user.role;
            if (loggedInUserRole === "owner") {
                return true;
            }
        }

        this.Auth.logout("owner");
        return false;
    }

}
