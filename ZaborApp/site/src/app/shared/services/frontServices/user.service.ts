import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Router, CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { map, catchError } from 'rxjs/operators';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json'
  })
};

@Injectable({
  providedIn: 'root'
})

export class UserService {
  public profilepic: string
  public sitedata: any
  public webdata: any
  constructor(private http: HttpClient, private route: Router) {
    this.Setuserdata()
  }

  Setuserdata() {
    if (localStorage.getItem('currentuser'))
      this.profilepic = JSON.parse(localStorage.getItem('currentuser')).user.profileimage;
    //this.currentUser.name = JSON.parse(localStorage.getItem('currentuser')).user.name;
  }

  getSiteInfo() {
    let url = `${environment.apiUrl}` + "/api/getsiteinfo";
    return this.http.get(url, httpOptions).pipe(
      map((resp: any) => {
        this.sitedata = resp.data
        this.webdata = resp.webdata
        return resp;
      })
    );
  }

  ContactUs(data) {
    let url = `${environment.apiUrl}` + "/api/contactus";
    return this.http.post(url, data, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  updateprofile(data) {
    let url = `${environment.apiUrl}` + "/api/user/update";
    return this.http.post(url, data).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  // logout() {
  //   localStorage.removeItem('token');
  //   localStorage.removeItem('currentuser');
  //   localStorage.removeItem('currentUserId');
  //   localStorage.removeItem('lat');
  //   localStorage.removeItem('long');
  //   const urlParts = this.route.url.substring(1).split('/');
  //   alert('frontServices/user.service - '+JSON.stringify(urlParts));
  //   this.route.navigate(['/login']);
  // }

  changeUserPassword(data) {
    let url = `${environment.apiUrl}` + "/api/change-password";
    return this.http.post(url, data, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  addAddress(data) {
    let url = `${environment.apiUrl}` + "/api/add-address";
    return this.http.post(url, data, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getAddress(user_id) {
    let url = `${environment.apiUrl}` + "/api/get-address?user_id=" + user_id;
    return this.http.get(url, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }
  getOrders(user_id, page) {
    // let url = `${environment.apiUrl}` + "/api/get-orders?user_id=" + user_id + "&page=" + page;
    let url = `${environment.apiUrl}` + "/user/get-orders?user_id=" + user_id + "&page=" + page;
    return this.http.get(url, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  deleteAddress(data) {
    let url = `${environment.apiUrl}` + "/api/delete-address";
    return this.http.post(url, data, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getFaqs() {
    let url = `${environment.apiUrl}` + "/api/faqs";
    return this.http.get(url, httpOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  driverReg(data) {
    let url = `${environment.apiUrl}` + "/api/driverReg";
    return this.http.post(url, data).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  ResReg(data) {
    let url = `${environment.apiUrl}` + "/api/ResReg";
    return this.http.post(url, data).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  testFcmMessage() {
    const testFcm = `${environment.apiUrl}` + '/user/testfcm';
    const fcmToken = localStorage.getItem('fcmToken');
    return this.http.post<any>(testFcm, { fcm_token: fcmToken }, httpOptions);
  }

}
