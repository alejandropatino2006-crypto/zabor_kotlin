import { Injectable } from '@angular/core';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { AuthenticationService } from '../services/authentication.service';
import {ClientStorageService} from '../services/client-storage.service';

@Injectable()
export class EmployeeAuthGuard implements CanActivate {

  constructor(private router: Router, private Auth: AuthenticationService, private clientStorage: ClientStorageService) { }

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {

    if (this.clientStorage.retrieveToken() != null && localStorage.getItem('currentuser') != null) {
      const loggedInUserRole = JSON.parse(localStorage.getItem('currentuser')).user.role;
      if (loggedInUserRole === "owner" || loggedInUserRole === 'employee') {
        return true;
      }
    }

    this.Auth.logout("pos");
    return false;
  }

}
