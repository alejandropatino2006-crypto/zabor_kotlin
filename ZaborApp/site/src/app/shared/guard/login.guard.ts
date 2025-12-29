import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import {ClientStorageService} from '../services/client-storage.service';

@Injectable()
export class LoginGuard implements CanActivate {

    constructor(private router: Router, private clientStorage: ClientStorageService) { }

    canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
        // if (localStorage.getItem('token') && localStorage.getItem('currentuser')) {
        if (this.clientStorage.retrieveToken() != null && localStorage.getItem('currentuser') != null) {
            // if (localStorage.getItem('currentuser') && JSON.parse(localStorage.getItem('currentuser')).user.role == 'owner') {
            //     this.router.navigate(['owner/dashboard']);
            //     return false;
            // }
            // if (localStorage.getItem('currentuser') && JSON.parse(localStorage.getItem('currentuser')).user.role == 'admin') {
            //     this.router.navigate(['admin/dashboard']);
            //     return false;
            // }
            // else
            // this.router.navigate(['/']);

            const loggedInArea = this.clientStorage.retrieveCurrentLoggedInArea();
            let nextPath = ['/'];
            if (loggedInArea != null && loggedInArea.length > 0) {
                if (loggedInArea === 'admin') { nextPath = ['/admin/dashboard']; }
                if (loggedInArea === 'owner') { nextPath = ['/owner/dashboard']; }
                if (loggedInArea === 'pos') { nextPath = ['/pos/dashboard']; }
            }
            this.router.navigate([nextPath]);
            return false;
        }

        return true;
    }

}
