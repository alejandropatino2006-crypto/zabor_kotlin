import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map, catchError } from 'rxjs/operators';
import { User } from '../../../shared/class/user';
import { UserService } from './../user.service';
import {ClientStorageService} from '../client-storage.service';
// import { handleError } from '../helpers/handleError';


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
        private clientStorage: ClientStorageService,
    ) {

    }

    login(user: {email: string; password: string}) {
        const login = `${environment.apiUrl}` + '/api/login';
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
                        this.clientStorage.storeCurrentLoggedInArea('user');
                    }
                }
                return resp;

            }));
    }

    loginWithFirebase(user: {email: string; password: string, external_login_type: string, firebase_uid: string; firebase_token: string; fcm_token: string}) {
        const login = `${environment.apiUrl}` + '/user/auxLogin';
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
                        this.clientStorage.storeCurrentLoggedInArea('user');
                        // this.clientStorage.storeFcmToken(user.fcm_token);
                    }
                }
                return resp;

            }));
    }

    socialLogin(data) {
        const login = `${environment.apiUrl}` + '/api/loginbySocial';
        return this.http.post<any>(login, data, httpOptions)
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
                        this.clientStorage.storeCurrentLoggedInArea('user');
                    }
                }
                return resp;

            }));
    }



    register(user) {
        const registerUrl = environment.apiUrl + "/api/registration";
        return this.http
            .post<any>(`${registerUrl}`, user, httpOptions)

    }

    // adminlogin(user: User) {
    //
    //     const login = `${environment.apiUrl}` + '/admin/login';
    //     return this.http.post<any>(login, user, httpOptions)
    //         .pipe(map(resp => {
    //             if (resp.status) {
    //                 if (resp.data.user && resp.data.token) {
    //
    //                     this.userSerVice.currentUser = resp.data.user;
    //                     // localStorage.setItem('token', resp.data.token.toString());
    //                     // localStorage.setItem('currentUserId', resp.data.user.id);
    //                     // localStorage.setItem('currentuser', JSON.stringify({ user: resp.data.user }));
    //                     this.clientStorage.storeToken(resp.data.token.toString());
    //                     this.clientStorage.storeCurrentUserId(resp.data.user.id);
    //                     this.clientStorage.storeCurrentUser({ user: resp.data.user });
    //                 }
    //             }
    //             return resp;
    //
    //         }));
    // }

    forgetPassword(user) {
        const forgetPasswordUrl = `${environment.apiUrl}` + '/api/forgetPassword';
        return this.http.post<any>(forgetPasswordUrl, user, httpOptions)
            .pipe(map(resp => {
                return resp;
            }));
    }


    changePassword(data) {
        data.loggedInUser_Id = parseInt(localStorage.getItem("currentUserId"));
        const changePassword = `${environment.apiUrl}` + '/change-password';
        return this.http
            .post<any>(`${changePassword}`, data, httpOptions)
            .pipe(
                map((resp: any) => {
                    return resp;
                })
            )
    }

    // logout() {
    //     localStorage.removeItem('token');
    //     localStorage.removeItem('currentuser');
    //     localStorage.removeItem('currentUserId');
    //     // localStorage.removeItem('lat');
    //     // localStorage.removeItem('long');
    //     const urlParts = this.route.url.substring(1).split('/');
    //     alert('frontServices/authentication.service - '+JSON.stringify(urlParts));
    //     if (this.route.url.split('admin/').length > 1) this.route.navigate(['/admin/login']);
    //     else this.route.navigate(['/login']);
    //
    // }


    verifyEmailPasscode(email, passcode) {
        const passcodeUrl = environment.apiUrl + "/api/verify-email-passcode";
        return this.http
          .post<any>(`${passcodeUrl}`, {email, passcode}, httpOptions);

    }


    deleteUser(data: object) {
        const deleteUrl = environment.apiUrl + "/api/delete-user";
        return this.http
          .post<any>(`${deleteUrl}`, data, httpOptions);

    }

    logoutNoNavigation() {
        localStorage.removeItem('token');
        localStorage.removeItem('currentuser');
        localStorage.removeItem('currentUserId');
        // localStorage.removeItem('lat');
        // localStorage.removeItem('long');

    }

}
