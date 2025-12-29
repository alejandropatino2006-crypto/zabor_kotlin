import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import {ClientStorageService} from '../services/client-storage.service';

@Injectable()
export class UserAuthGuard implements CanActivate {

    constructor(private router: Router, private Auth: AuthenticationService, private clientStorage: ClientStorageService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        // if (localStorage.getItem('token') && localStorage.getItem('currentuser')) {
        //     return true;
        // } else {
        //     this.Auth.logout();
        //     this.router.navigate(['/login']);
        //     return false;
        // }

        if (this.clientStorage.retrieveToken() != null && localStorage.getItem('currentuser') != null) {
            const loggedInUserRole = JSON.parse(localStorage.getItem('currentuser')).user.role;
            if (loggedInUserRole === "user") {
                return true;
            }
        }

        this.Auth.logout();
        return false;
    }

}
