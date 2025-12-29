import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { User } from '../../shared/class/user';
import { UserService } from './user.service';
// import { handleError } from '../helpers/handleError';
import { RestaurantService } from './restaurant.service'
import {ClientStorageService} from './client-storage.service';

const httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json'
    })
};

@Injectable({
    providedIn: 'root'
})
export class AuthenticationService {


    constructor(
        private http: HttpClient,
        private route: Router,
        private userSerVice: UserService,
        private restaurantService: RestaurantService,
        private clientStorage: ClientStorageService,
    ) { }

    ownerLogin(user: User) {
        const login = `${environment.apiUrl}` + '/owner/login';
        return this.http.post<any>(login, user, httpOptions)
            .pipe(map(resp => {
                if (resp.status) {
                    if (resp.data.user && resp.data.token) {
                        this.userSerVice.currentUser = resp.data.user;
                        // localStorage.setItem('token', resp.data.token.toString());
                        // localStorage.setItem('currentUserId', resp.data.user.id);
                        // localStorage.setItem('currentuser', JSON.stringify({ user: resp.data.user }));
                        this.clientStorage.storeToken(resp.data.token.toString(), true);
                        this.clientStorage.storeCurrentUserId(resp.data.user.id);
                        this.clientStorage.storeCurrentUser({ user: resp.data.user });
                        this.clientStorage.storeCurrentLoggedInArea('owner');
                        // this.restaurantService.updateCurrentUserId();
                        // this.restaurantService.subscribeWebsocket()
                        // this.restaurantService.sendNextWebsocketRequest()
                        // setTimeout(() => {
                        //     this.restaurantService.closeWebsocket()
                        // }, 20000);
                    }
                }
                return resp;
            }));
    }

    employeelogin(user: User) {
        const login = `${environment.apiUrl}` + '/employee/login';
        return this.http.post<any>(login, user, httpOptions)
            .pipe(map(resp => {
                if (resp.status) {
                    if (resp.data.user && resp.data.token) {
                        this.userSerVice.currentUser = resp.data.user;
                        // localStorage.setItem('token', resp.data.token.toString());
                        // localStorage.setItem('currentUserId', resp.data.user.id);
                        // localStorage.setItem('currentuser', JSON.stringify({ user: resp.data.user }));
                        this.clientStorage.storeToken(resp.data.token.toString());
                        this.clientStorage.storeCurrentUserId(resp.data.user.id);
                        this.clientStorage.storeCurrentUser({ user: resp.data.user });
                        this.clientStorage.storeCurrentLoggedInArea('pos');
                        // this.restaurantService.updateCurrentUserId();
                        // this.restaurantService.subscribeWebsocket()
                        // this.restaurantService.sendNextWebsocketRequest()
                        // setTimeout(() => {
                        //     this.restaurantService.closeWebsocket()
                        // }, 20000);
                    }
                }
                return resp;
            }));
    }

    adminlogin(user: User) {
        const login = `${environment.apiUrl}` + '/admin/login';
        return this.http.post<any>(login, user, httpOptions)
            .pipe(map(resp => {
                if (resp.status) {
                    if (resp.data.user && resp.data.token) {
                        this.userSerVice.currentUser = resp.data.user;
                        // localStorage.setItem('token', resp.data.token.toString());
                        // localStorage.setItem('currentUserId', resp.data.user.id);
                        // localStorage.setItem('currentuser', JSON.stringify({ user: resp.data.user }));
                        this.clientStorage.storeToken(resp.data.token.toString());
                        this.clientStorage.storeCurrentUserId(resp.data.user.id);
                        this.clientStorage.storeCurrentUser({ user: resp.data.user });
                        this.clientStorage.storeCurrentLoggedInArea('admin');
                    }
                }
                return resp;
            }));
    }

    forgetPassword(user) {
        const forgetPasswordUrl = `${environment.apiUrl}` + '/user/forgetPassword';
        return this.http.post<any>(forgetPasswordUrl, user, httpOptions)
            .pipe(map(resp => {
                return resp;
            }));
    }


    changeOwnerPassword(data) {
        // data.loggedInUser_Id = parseInt(localStorage.getItem("currentUserId"), 10);
        const changePassword = `${environment.apiUrl}` + '/owner/change-password';
        return this.http
            .post<any>(`${changePassword}`, data, httpOptions)
            .pipe(
                map((resp: any) => {
                    return resp;
                })
            )
    }

    changeAdminPassword(data) {
        // data.loggedInUser_Id = parseInt(localStorage.getItem("currentUserId"));
        const changePassword = `${environment.apiUrl}` + '/admin/change-password';
        return this.http
            .post<any>(`${changePassword}`, data, httpOptions)
            .pipe(
                map((resp: any) => {
                    return resp;
                })
            )
    }

    logout(requestedLoginArea?: string) {
        // const loggedInUserRole = JSON.parse(localStorage.getItem('currentuser')).user.role;
        const loggedInArea = this.clientStorage.retrieveCurrentLoggedInArea() || requestedLoginArea;

        // localStorage.removeItem('token');
        this.clientStorage.clearToken();
        // localStorage.removeItem('currentuser');
        this.clientStorage.clearCurrentUser();
        // localStorage.removeItem('currentUserId');
        this.clientStorage.clearCurrentUserId();
        localStorage.removeItem('lat');
        localStorage.removeItem('long');
        this.clientStorage.clearCurrentLoggedInArea();
        this.clientStorage.clearFcmToken();

        // if (this.route.url.split('admin/').length > 1) this.route.navigate(['/admin/login']);
        // if (this.route.url.split('owner/').length > 1) this.route.navigate(['/owner/login']);
        // if (this.route.url.split('employee/').length > 1) this.route.navigate(['/employee/login']);
        // else this.route.navigate(['/login']);

        // const urlParts = this.route.url.substring(1).split('/');
        // alert(JSON.stringify(urlParts));
        // // alert(JSON.stringify(urlParts));
        // let nextLoginPath = ['/login'];
        // alert(urlParts.length);
        // if (urlParts.length > 0) {
        //     if (urlParts[0] === 'admin') { nextLoginPath = ['/admin/login']; }
        //     if (urlParts[0] === 'owner') { nextLoginPath = ['/owner/login']; }
        //     if (urlParts[0] === 'pos') { nextLoginPath = ['/pos/login']; }
        // }
        let nextLoginPath = ['/login'];
        if (loggedInArea != null && loggedInArea.length > 0) {
            if (loggedInArea === 'admin') { nextLoginPath = ['/admin/login']; }
            if (loggedInArea === 'owner') { nextLoginPath = ['/owner/login']; }
            if (loggedInArea === 'pos') { nextLoginPath = ['/pos/login']; }
        }
        console.log('current url =', this.route.url, nextLoginPath);
        // alert(nextLoginPath);
        this.route.navigate(nextLoginPath);

        //  this.restaurantService.myWebSocket.unsubscribe()
    }

}
