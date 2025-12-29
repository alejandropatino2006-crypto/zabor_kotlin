import { Injectable } from "@angular/core";
import {
  HttpClient,
  HttpHeaders,
  HttpErrorResponse, HttpParams
} from '@angular/common/http';
import { environment } from "../../../environments/environment";

import { Observable, of, throwError, BehaviorSubject } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { User } from "../../shared/class/user";
import { JsonPipe } from "@angular/common";
import { ClientStorageService } from './client-storage.service';
import { HttpOptionsService } from './http-options.service';


//get token
const token = localStorage.getItem('token');
const httpOptions = {
    headers: new HttpHeaders({
        "Content-Type": "application/json",
    })
};

@Injectable({
    providedIn: "root"
})
export class UserService {
    public currentUser: User;
    public apiUrl: string = `${environment.apiUrl}`;
    //get user id and send it with each request
    public loggedInUser_Id: Number;


  private readonly httpGetOptions: {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    observe?: 'body';
    params?: HttpParams | { [param: string]: string | string[] };
    reportProgress?: boolean;
    responseType: 'json';
    withCredentials?: boolean;
  };

  private readonly httpPostOptionsWithDataOnly: {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    observe?: 'body';
    params?: HttpParams | { [param: string]: string | string[] };
    reportProgress?: boolean;
    responseType: 'json';
    withCredentials?: boolean;
  };

  private readonly httpPostOptionsWithDataAndFiles: {
    headers?: HttpHeaders | { [header: string]: string | string[] };
    observe?: 'body';
    params?: HttpParams | { [param: string]: string | string[] };
    reportProgress?: boolean;
    responseType: 'json';
    withCredentials?: boolean;
  };

  constructor(
      private http: HttpClient,
      private clientStorage: ClientStorageService,
      private httpOptionsService: HttpOptionsService,
    ) {
    this.httpGetOptions = this.httpOptionsService.makeHttpRequestGetOptions();
    this.httpPostOptionsWithDataOnly = this.httpOptionsService.makeHttpRequestPostOptionsWithDataOnly();
    this.httpPostOptionsWithDataAndFiles = this.httpOptionsService.makeHttpRequestPostOptionsWithDataAndFiles();

        this.currentUser = {
            id: 0,
            name: "",
            email: "",
            role: "",
            address: "",
            city: "",
            phone: "",
            status: 0,
            profilepic: ""
        };
    }

  private clearHttpParams(requestType: 'GET' | 'POST-DATA-ONLY' | 'POST-DATA-PLUS-FILES', createParamsIfNull = false) {
    if (requestType === 'POST-DATA-ONLY') {
      if (this.httpPostOptionsWithDataOnly.params != null) {
        const paramKeys = (this.httpPostOptionsWithDataOnly.params as HttpParams).keys();
        for (const paramKey of paramKeys) {
          this.httpPostOptionsWithDataOnly.params = (this.httpPostOptionsWithDataOnly.params as HttpParams).delete(paramKey);
        }
      }
      if (this.httpPostOptionsWithDataOnly.params == null && createParamsIfNull) {
        this.httpPostOptionsWithDataOnly.params = new HttpParams();
      }
      return this.httpPostOptionsWithDataOnly.params as HttpParams;
    }
    if (requestType === 'POST-DATA-PLUS-FILES') {
      if (this.httpPostOptionsWithDataAndFiles.params != null) {
        const paramKeys = (this.httpPostOptionsWithDataAndFiles.params as HttpParams).keys();
        for (const paramKey of paramKeys) {
          this.httpPostOptionsWithDataAndFiles.params = (this.httpPostOptionsWithDataAndFiles.params as HttpParams).delete(paramKey);
        }
      }
      if (this.httpPostOptionsWithDataAndFiles.params == null && createParamsIfNull) {
        this.httpPostOptionsWithDataAndFiles.params = new HttpParams();
      }
      return this.httpPostOptionsWithDataAndFiles.params as HttpParams;
    }

    // default : for GET
    if (this.httpGetOptions.params != null) {
      const paramKeys = (this.httpGetOptions.params as HttpParams).keys();
      for (const paramKey of paramKeys) {
        this.httpGetOptions.params = (this.httpGetOptions.params as HttpParams).delete(paramKey);
      }
    }
    // console.log('CHECK', this.httpGetOptions.params == null);
    if (this.httpGetOptions.params == null && createParamsIfNull) {
      this.httpGetOptions.params = new HttpParams();
    }
    // this.httpGetOptions.params = this.httpGetOptions.params as HttpParams;
    return this.httpGetOptions.params as HttpParams;
  }

    Setuserdata() {
        this.currentUser.profilepic = JSON.parse(localStorage.getItem('currentuser')).user.profileimage;
        this.currentUser.name = JSON.parse(localStorage.getItem('currentuser')).user.name;
    }
    //Register User

    dashboard() {
        this.loggedInUser_Id = parseInt(localStorage.getItem("currentUserId"));
        const dashboard = `${environment.apiUrl}` + "/user/dashboard?loggedInUser_Id=" + this.loggedInUser_Id;
        return this.http.get(dashboard, httpOptions).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }

    register(user) {
        const registerUrl = this.apiUrl + "/user/registration";
        return this.http
            .post<any>(`${registerUrl}`, user, httpOptions)

    }


    //Get current User LoggedIn for Admin panel
    getCurrentUser(userid) {
        this.loggedInUser_Id = parseInt(localStorage.getItem("currentUserId"));
        const getuser = `${environment.apiUrl}` + "/user/getUserinfo?userid=" + userid + "&loggedInUser_Id=" + this.loggedInUser_Id;
        return this.http.get(getuser, httpOptions).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }

    updateProfile(user) {
        // this.loggedInUser_Id = parseInt(localStorage.getItem("currentUserId"));
        // const updateUSerUrl = this.apiUrl + "/user/update?loggedInUser_Id=" + this.loggedInUser_Id;
        // return this.http
        //     .post<any>(`${updateUSerUrl}`, user)
        //     .pipe(
        //         map((resp: any) => {
        //
        //             return resp;
        //         })
        //     )
      // this.httpPostOptionsWithDataAndFiles.params = this.clearHttpParams('POST-DATA-PLUS-FILES', true).set('loggedInUser_Id', localStorage.getItem("currentUserId"));
      this.httpPostOptionsWithDataAndFiles.params = this.clearHttpParams('POST-DATA-PLUS-FILES');
      return this.http.post(this.apiUrl + '/user/update', user, this.httpPostOptionsWithDataAndFiles)
        .pipe(
          map((resp: any) => {
            return resp;
          })
        );
    }
    resetpasswordforFront(data) {
        return this.http.post<any>(`${this.apiUrl}` + "/api/resetpassword", data, httpOptions).pipe(map((resp: any) => { return resp; }))
    }

    activeuser(data) {
        return this.http.post<any>(`${this.apiUrl}` + "/user/activeuser", data, httpOptions).pipe(map((resp: any) => { return resp; }))
    }

    sendmsg(data) {
        this.loggedInUser_Id = parseInt(localStorage.getItem("currentUserId"));
        data.loggedInUser_Id = this.loggedInUser_Id;
        return this.http.post<any>(`${this.apiUrl}` + "/user/sendmsg", data, httpOptions).pipe(map((resp: any) => { return resp; }))
    }

    getnotifications(page) {
        this.loggedInUser_Id = parseInt(localStorage.getItem("currentUserId"));
        const notiurl = `${environment.apiUrl}` + "/user/getnotifications?page=" + page + "&loggedInUser_Id=" + this.loggedInUser_Id;
        return this.http.get(notiurl, httpOptions).pipe(
            map((resp: any) => {
                return resp;
            })
        );
    }

  storeSignupEmail(email: string) {
    this.clientStorage.storeSignupEmail(email);
  }

  getSignupEmail(): string | null {
    return this.clientStorage.retrieveSignupEmail();
  }

  clearSignupEmail() {
    this.clientStorage.clearSignupEmail();
  }
}
