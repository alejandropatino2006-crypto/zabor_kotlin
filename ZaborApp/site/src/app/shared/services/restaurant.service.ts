import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders, HttpParams, HttpErrorResponse } from '@angular/common/http';
import { environment } from "../../../environments/environment";
import { Observable, of, throwError, interval, Subscription } from "rxjs";
import { catchError, map, tap } from "rxjs/operators";
import { JsonPipe } from "@angular/common";
import Swal from 'sweetalert2';
// import { ClientStorageService } from './client-storage.service';
import { HttpOptionsService } from './http-options.service';

@Injectable({
  providedIn: "root"
})
export class RestaurantService {
  private apiUrl = `${environment.apiUrl}`;
  // private _requestQueryParams: HttpParams | undefined;

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


  // get user id and send it with each request
  // private loggedInUser_Id = localStorage.getItem("currentUserId");


  constructor(
    private http: HttpClient,
    // private clientStorage: ClientStorageService,
    private httpOptionsService: HttpOptionsService,
  ) {
    // this._requestQueryParams = new HttpParams({fromObject: {'loggedInUser_Id': this.clientStorage.retrieveCurrentUserIdAsString()}});
    this.httpGetOptions = this.httpOptionsService.makeHttpRequestGetOptions();
    this.httpPostOptionsWithDataOnly = this.httpOptionsService.makeHttpRequestPostOptionsWithDataOnly();
    this.httpPostOptionsWithDataAndFiles = this.httpOptionsService.makeHttpRequestPostOptionsWithDataAndFiles();
  }

  // get requestQueryParams(): HttpParams {
  //     if (this._requestQueryParams.get('loggedInUser_Id') == null) {
  //         console.warn('NULL user-id in storage');
  //         this._requestQueryParams = new HttpParams({fromObject: {'loggedInUser_Id': this.clientStorage.retrieveCurrentUserIdAsString()}});
  //     }
  //     return this._requestQueryParams;
  // }

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

  // updateCurrentUserId() {
  //     const loggedInUserId = this.clientStorage.retrieveCurrentUserIdAsString();
  //     // if (this._requestQueryParams != null) {
  //     //     if (this._requestQueryParams.has('loggedInUser_Id')) {
  //     //         this._requestQueryParams.delete('loggedInUser_Id');
  //     //     }
  //     //     this._requestQueryParams = this._requestQueryParams.set('loggedInUser_Id', loggedInUserId);
  //     // } else
  //     this._requestQueryParams = new HttpParams({fromObject: {'loggedInUser_Id': loggedInUserId}});
  // }

  getrestaurantslist() {
    // const getrestorent = `${this.apiUrl}` + "/user/getuserrestaurants?loggedInUser_Id=" + localStorage.getItem("currentUserId");
    // this.httpGetOptions.params = this.requestQueryParams;
    this.httpGetOptions.params = this.clearHttpParams('GET');
    return this.http.get(`${this.apiUrl}/user/getuserrestaurants`, this.httpGetOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getReportslist() {
    // const getrestorent = `${this.apiUrl}` + "/user/getuserrestaurants?loggedInUser_Id=" + localStorage.getItem("currentUserId");
    // this.httpGetOptions.params = this.requestQueryParams;
    this.httpGetOptions.params = this.clearHttpParams('GET');
    return this.http.get(`${this.apiUrl}/user/getAllReportsTotal`, this.httpGetOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getAllEmployeesByRest(restrtId) {
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('resid', restrtId);
    return this.http.get(`${this.apiUrl}/user/getAllEmployeesByRest`, this.httpGetOptions)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getAllShifts(restrtId) {
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('resid', restrtId);
    return this.http.get(`${this.apiUrl}/user/getAllShiftsByRest`, this.httpGetOptions)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getAllShiftsByRestAndDate(restrtId, mysqlStartDate) {
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('resid', restrtId).set('selectedDate', mysqlStartDate);
    return this.http.get(`${this.apiUrl}/user/getAllShiftsByRestAndDate`, this.httpGetOptions)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getAllShiftsByRestAndDateAndEmp(restrtId, mysqlStartDate, employeeId) {
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('resid', restrtId).set('selectedDate', mysqlStartDate).set('empid', employeeId);
    return this.http.get(`${this.apiUrl}/user/getAllShiftsByRestAndDateAndEmp`, this.httpGetOptions)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getExistingUpcNos(): Observable<any> {
    this.httpGetOptions.params = this.clearHttpParams('GET');
    return this.http.get(`${this.apiUrl}/user/upc_nos`, this.httpGetOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
    // const url = `${this.apiUrl}/menugroupitem/upc_nos`; // Replace with your API endpoint
    // return this.http.get<string[]>(url);
  }

  changerestaurantStatus(data) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    data.loggedInUser_Id = localStorage.getItem("currentUserId");
    return this.http.post(this.apiUrl + "/user/changerestaurantStatus", data, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  checkEmployeeAccessCodeExists(data) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // data.loggedInUser_Id = localStorage.getItem("currentUserId");
    return this.http.post(this.apiUrl + "/user/check-employee-access-code-exist", data, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  checkEmployeePasswordExists(data) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // data.loggedInUser_Id = localStorage.getItem("currentUserId");
    return this.http.post(this.apiUrl + "/user/check-employee-password-exist", data, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  createRestaurant(data) {
    // const createRestaurantUrl = this.apiUrl + "/user/createRestaurant?loggedInUser_Id=" + localStorage.getItem("currentUserId");
    // this.httpPostOptionsWithDataOnly.params = this.requestQueryParams;
    this.httpPostOptionsWithDataAndFiles.params = this.clearHttpParams('POST-DATA-PLUS-FILES');
    return this.http
      .post<any>(`${this.apiUrl}/user/createRestaurant`, data, this.httpPostOptionsWithDataAndFiles)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  createInventory(data) {
    // const createRestaurantUrl = this.apiUrl + "/user/createRestaurant?loggedInUser_Id=" + localStorage.getItem("currentUserId");
    // this.httpPostOptionsWithDataOnly.params = this.requestQueryParams;
    this.httpPostOptionsWithDataAndFiles.params = this.clearHttpParams('POST-DATA-PLUS-FILES');
    return this.http
      .post<any>(`${this.apiUrl}/user/createInventory`, data, this.httpPostOptionsWithDataAndFiles)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  changePassword(data) {
    this.httpPostOptionsWithDataAndFiles.params = this.clearHttpParams('POST-DATA-PLUS-FILES');
    return this.http
      .put<any>(`${this.apiUrl}/user/employeeChangePassword`, data, this.httpPostOptionsWithDataAndFiles)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  createEmployee(data) {
    // const createRestaurantUrl = this.apiUrl + "/user/createRestaurant?loggedInUser_Id=" + localStorage.getItem("currentUserId");
    // this.httpPostOptionsWithDataOnly.params = this.requestQueryParams;
    this.httpPostOptionsWithDataAndFiles.params = this.clearHttpParams('POST-DATA-PLUS-FILES', true).set('userid', localStorage.getItem("currentUserId"));
    return this.http
      .post<any>(`${this.apiUrl}/user/createEmployee`, data, this.httpPostOptionsWithDataAndFiles)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  saveEmployee(data) {
    // const createRestaurantUrl = this.apiUrl + "/user/createRestaurant?loggedInUser_Id=" + localStorage.getItem("currentUserId");
    // this.httpPostOptionsWithDataOnly.params = this.requestQueryParams;
    this.httpPostOptionsWithDataAndFiles.params = this.clearHttpParams('POST-DATA-PLUS-FILES', true).set('userid', localStorage.getItem("currentUserId"));
    return this.http
      .put<any>(`${this.apiUrl}/user/saveEmployee`, data, this.httpPostOptionsWithDataAndFiles)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  saveInventory(data) {
    // const createRestaurantUrl = this.apiUrl + "/user/createRestaurant?loggedInUser_Id=" + localStorage.getItem("currentUserId");
    // this.httpPostOptionsWithDataOnly.params = this.requestQueryParams;
    this.httpPostOptionsWithDataAndFiles.params = this.clearHttpParams('POST-DATA-PLUS-FILES');
    return this.http
      .put<any>(`${this.apiUrl}/user/saveInventory`, data, this.httpPostOptionsWithDataAndFiles)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  deleteInventory(id) {
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('inventoryid', id);
    return this.http.get(`${this.apiUrl}/user/deleteInventory`, this.httpGetOptions)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  deleteEmployee(id) {
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('employeeid', id);
    return this.http.get(`${this.apiUrl}/user/deleteEmployee`, this.httpGetOptions)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  deleteInventoryItem(id) {
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('inventoryitemid', id);
    return this.http.get(`${this.apiUrl}/user/deleteInventoryItem`, this.httpGetOptions)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }


  getcategoriesofRestaurent() {
    // return this.http.get(this.apiUrl + "/user/getcategories?loggedInUser_Id=" + localStorage.getItem("currentUserId"), httpOptions).pipe(map((res: any) => { return res }))
    // this.httpGetOptions.params = this.requestQueryParams;
    this.httpGetOptions.params = this.clearHttpParams('GET');
    return this.http.get(`${this.apiUrl}/user/getcategories`, this.httpGetOptions)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getInventoryDetails() {
    // return this.http.get(this.apiUrl + "/user/getcategories?loggedInUser_Id=" + localStorage.getItem("currentUserId"), httpOptions).pipe(map((res: any) => { return res }))
    // this.httpGetOptions.params = this.requestQueryParams;
    this.httpGetOptions.params = this.clearHttpParams('GET');
    return this.http.get(`${this.apiUrl}/user/getinventorydetails?userid=${localStorage.getItem("currentUserId")}`, this.httpGetOptions)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getJobTitles() {
    // return this.http.get(this.apiUrl + "/user/getcategories?loggedInUser_Id=" + localStorage.getItem("currentUserId"), httpOptions).pipe(map((res: any) => { return res }))
    // this.httpGetOptions.params = this.requestQueryParams;
    this.httpGetOptions.params = this.clearHttpParams('GET');
    return this.http.get(`${this.apiUrl}/user/getJobTitles?userid=${localStorage.getItem("currentUserId")}`, this.httpGetOptions)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getsubcategory(catid) {
    // return this.http.get(this.apiUrl + "/user/getsubcategory?catid=" + catid + "&loggedInUser_Id=" + localStorage.getItem("currentUserId"), httpOptions).pipe(map((res: any) => { return res }))
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('catid', catid);
    return this.http.get(`${this.apiUrl}/user/getsubcategory`, this.httpGetOptions)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getRestaurant(restrtId, userid) {
    // tslint:disable-next-line:max-line-length
    // return this.http.get(this.apiUrl + "/user/getrestaurant?res_id=" + restrtId + "&loggedInUser_Id=" + localStorage.getItem("currentUserId") + "&userid=" + userid, httpOptions).pipe(map((res: any) => { return res }))
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('res_id', restrtId).set('userid', userid);
    return this.http.get(`${this.apiUrl}/user/getrestaurant`, this.httpGetOptions)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  updateRestaurant(data) {
    // const updateRestaurantUrl = this.apiUrl + "/user/updateRestaurant?loggedInUser_Id=" + localStorage.getItem("currentUserId");
    // this.httpPostOptionsWithDataOnly.headers = (this.httpPostOptionsWithDataOnly.headers as HttpHeaders).set('Content-Type', 'multipart/form-data');
    // this.httpPostOptionsWithDataOnly.params = this.requestQueryParams;
    this.httpPostOptionsWithDataAndFiles.params = this.clearHttpParams('POST-DATA-PLUS-FILES');
    return this.http
      .post<any>(`${this.apiUrl}/user/updateRestaurant`, data, this.httpPostOptionsWithDataAndFiles)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );

  }
  getgroupsofMenu(restrtId) {
    // return this.http.get(this.apiUrl + "/user/getrestaurantgroups?resid=" + restrtId + "&loggedInUser_Id=" + localStorage.getItem("currentUserId")).pipe(map((res: any) => { return res }))
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('resid', restrtId);
    return this.http.get(`${this.apiUrl}/user/getrestaurantgroups`, this.httpGetOptions)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getgroupsofMenuforadmin(restrtId) {
    // return this.http.get(this.apiUrl + "/admin/getrestaurantgroups?resid=" + restrtId + "&loggedInUser_Id=" + localStorage.getItem("currentUserId")).pipe(map((res: any) => { return res }))
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('resid', restrtId);
    return this.http.get(`${this.apiUrl}/admin/getrestaurantgroups`, this.httpGetOptions)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  createGroup(data) {
    // return this.http.post<any>(this.apiUrl + '/user/creategroup?loggedInUser_Id=' + localStorage.getItem("currentUserId"), data).pipe(map((res: any) => { return res }))
    // this.httpPostOptionsWithDataOnly.params = this.requestQueryParams;
    this.httpPostOptionsWithDataAndFiles.params = this.clearHttpParams('POST-DATA-PLUS-FILES');
    return this.http.post<any>(`${this.apiUrl}/user/creategroup`, data, this.httpPostOptionsWithDataAndFiles)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getGroup(resid, groupid) {
    // return this.http.get(this.apiUrl + "/user/getmenuGroup?resid=" + resid + "&groupid=" + groupid + "&loggedInUser_Id=" + localStorage.getItem("currentUserId")).pipe(map((res: any) => { return res }))
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('resid', resid).set('groupid', groupid);
    return this.http.get(`${this.apiUrl}/user/getmenuGroup`, this.httpGetOptions)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getCustomization(resid, groupid) {
    // return this.http.get(this.apiUrl + "/user/getGroupCustomization?resid=" + resid + "&groupid=" + groupid + "&loggedInUser_Id=" + localStorage.getItem("currentUserId")).pipe(map((res: any) => { return res }))
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('resid', resid).set('groupid', groupid);
    return this.http.get(`${this.apiUrl}/user/getGroupCustomization`, this.httpGetOptions)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  deletegroup(resid, groupid) {
    // return this.http.get(this.apiUrl + "/user/deleteGroup?resid=" + resid + "&groupid=" + groupid + "&loggedInUser_Id=" + localStorage.getItem("currentUserId")).pipe(map((res: any) => { return res }))
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('resid', resid).set('groupid', groupid);
    return this.http.get(`${this.apiUrl}/user/deleteGroup`, this.httpGetOptions)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  deleteCustomization(resid, id) {
    // return this.http.get(this.apiUrl + "/user/deleteCustomization?resid=" + resid + "&id=" + id + "&loggedInUser_Id=" + localStorage.getItem("currentUserId")).pipe(map((res: any) => { return res }))
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('resid', resid).set('id', id);
    return this.http.get(`${this.apiUrl}/user/deleteCustomization`, this.httpGetOptions)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getrestaurantslistForAdmin(userid) {
    // const getrestorent = `${this.apiUrl}` + "/admin/getrestaurantlist?userid=" + userid + "&loggedInUser_Id=" + localStorage.getItem("currentUserId");
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('userid', userid);
    return this.http.get(`${this.apiUrl}/user/getrestaurantlist`, this.httpGetOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getrestaurantdetail(restrtId) {
    // return this.http.get(this.apiUrl + "/admin/getrestaurantdetail?loggedInUser_Id=" + localStorage.getItem("currentUserId") + "&res_id=" + restrtId, httpOptions).pipe(
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('res_id', restrtId);
    return this.http.get(`${this.apiUrl}/admin/getrestaurantdetail`, this.httpGetOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  changerestaurantStatusForAdmin(data) {
    // TODO: test by commenting/removing the next line below
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    data.loggedInUser_Id = localStorage.getItem("currentUserId");
    return this.http.post(`${this.apiUrl}/admin/changerestaurantStatus`, data, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  deleteRestaurant(restrtId) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(`${this.apiUrl}/user/deleteRestaurant`, { res_id: restrtId, loggedInUser_Id: localStorage.getItem("currentUserId") }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getadvert() {
    // const getadvert = `${this.apiUrl}` + "/user/promoAdvert?loggedInUser_Id=" + localStorage.getItem("currentUserId");
    this.httpGetOptions.params = this.clearHttpParams('GET');
    return this.http.get(`${this.apiUrl}/user/promoAdvert`, this.httpGetOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  addAdvert(data) {
    // return this.http.post(this.apiUrl + "/user/addPromoAdvert?loggedInUser_Id=" + localStorage.getItem("currentUserId"), data).pipe(map((res: any) => { return res }));
    this.httpPostOptionsWithDataAndFiles.params = this.clearHttpParams('POST-DATA-PLUS-FILES');
    return this.http.post(`${this.apiUrl}/user/addPromoAdvert`, data, this.httpPostOptionsWithDataAndFiles)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getadvertbyId(id) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(`${this.apiUrl}/user/get-advertbyid`, { id, loggedInUser_Id: localStorage.getItem("currentUserId") }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  deleteAdvert(advertId) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    // return this.http.post(`${this.apiUrl}/user/delete-advert`, { advert_id: advertId, loggedInUser_Id: localStorage.getItem("currentUserId") }, this.httpPostOptionsWithDataOnly)
    return this.http.post(`${this.apiUrl}/user/delete-advert`, { advert_id: advertId }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getpromovideo() {
    // const getadvert = `${this.apiUrl}` + "/user/promoVideo?loggedInUser_Id=" + localStorage.getItem("currentUserId");
    this.httpGetOptions.params = this.clearHttpParams('GET');
    return this.http.get(`${this.apiUrl}/user/promoVideo`, this.httpGetOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  addpromovideo(data) {
    // return this.http.post(this.apiUrl + "/user/addPromoVideo?loggedInUser_Id=" + localStorage.getItem("currentUserId"), data).pipe(map((res: any) => { return res }));
    this.httpPostOptionsWithDataAndFiles.params = this.clearHttpParams('POST-DATA-PLUS-FILES');
    return this.http.post(`${this.apiUrl}/user/addPromoVideo`, data, this.httpPostOptionsWithDataAndFiles)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getpromovideobyId(id) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(this.apiUrl + "/user/get-promovideobyid", { id, loggedInUser_Id: localStorage.getItem("currentUserId") }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  deletePromoVideo(videoId) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    // return this.http.post(this.apiUrl + "/user/delete-promovideo", { video_id: videoId, loggedInUser_Id: localStorage.getItem("currentUserId") }, this.httpPostOptionsWithDataOnly)
    return this.http.post(this.apiUrl + "/user/delete-promovideo", { video_id: videoId }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  addInventory(data) {
    // return this.http.post(this.apiUrl + "/user/addPromoVideo?loggedInUser_Id=" + localStorage.getItem("currentUserId"), data).pipe(map((res: any) => { return res }));
    this.httpPostOptionsWithDataAndFiles.params = this.clearHttpParams('POST-DATA-PLUS-FILES');
    return this.http.post(`${this.apiUrl}/user/addInventory`, data, this.httpPostOptionsWithDataAndFiles)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  changeadvertStatus(data) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by commenting/removing the next line below
    data.loggedInUser_Id = localStorage.getItem("currentUserId");
    return this.http.post(this.apiUrl + '/user/advert/status-change', data, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  changepromovideoStatus(data) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by commenting/removing the next line below
    data.loggedInUser_Id = localStorage.getItem("currentUserId");
    return this.http.post(this.apiUrl + '/user/promovideo/status-change', data, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getReview(data) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by commenting/removing the next line below
    data.loggedInUser_Id = localStorage.getItem("currentUserId");
    return this.http.post(`${this.apiUrl}/user/reviews`, data, this.httpPostOptionsWithDataOnly).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getreviewstatus(restrtId) {
    // const getreviewsstauts = `${this.apiUrl}` + "/user/reviewsstatus?res_id=" + restrtId + '&loggedInUser_Id=' + localStorage.getItem("currentUserId");;
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('res_id', restrtId);
    return this.http.get(`${this.apiUrl}/user/reviewsstatus`, this.httpGetOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  deletereview(reviewId) {
    // return this.http.get(this.apiUrl + '/admin/deletereview?review_id=' + review_id + "&loggedInUser_Id=" + localStorage.getItem("currentUserId"), httpOptions).pipe(
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('review_id', reviewId);
    return this.http.get(`${this.apiUrl}/admin/deletereview`, this.httpGetOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  uploadgalleryImage(data) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by commenting/removing the next line below
    data.loggedInUser_Id = localStorage.getItem("currentUserId");
    return this.http.post(this.apiUrl + '/user/gallery', data, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getGalleryImage(restrtId) {
    // return this.http.get(this.apiUrl + '/user/getgallaryImage?res_id=' + restrtId + "&loggedInUser_Id=" + localStorage.getItem("currentUserId"), httpOptions).pipe(
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('res_id', restrtId);
    return this.http.get(`${this.apiUrl}/user/getgallaryImage`, this.httpGetOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  deletegalleryimage(imageId, restrtId, imgPath) {
    // return this.http.get(this.apiUrl + '/user/deletegalleryImage?img_path=' + imgPath + '&id=' + imageId + '&res_id=' + restrtId + "&loggedInUser_Id=" + localStorage.getItem("currentUserId"), httpOptions).pipe(
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('img_path', imgPath).set('id', imageId).set('res_id', restrtId);
    return this.http.get(`${this.apiUrl}/user/deletegalleryImage`, this.httpGetOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  changeadvertStatusForAdmin(data) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by commenting/removing the next line below
    data.loggedInUser_Id = localStorage.getItem("currentUserId");
    return this.http.post(`${this.apiUrl}/admin/change-advert-status`, data, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  changeadvertvideoStatusForAdmin(data) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by commenting/removing the next line below
    data.loggedInUser_Id = localStorage.getItem("currentUserId");
    return this.http.post(`${this.apiUrl}/admin/change-advertvideo-status`, data, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  saveCustomizations(data) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by commenting/removing the next line below
    // data.loggedInUser_Id = localStorage.getItem('currentUserId');
    return this.http.post(`${this.apiUrl}/user/save-customizations`, data, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getCustomizationDetail(id) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(`${this.apiUrl}/user/getCustomizationDetail`, { loggedInUser_Id: localStorage.getItem('currentUserId'), id }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getOrderDetail(id) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(`${this.apiUrl}/user/order-detail`, { loggedInUser_Id: localStorage.getItem('currentUserId'), orderid: id }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  changeOrderStatus(data) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    return this.http.post(`${this.apiUrl}/user/changeorderstatus`, data, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getOwnerlist() {
    // return this.http.get(this.apiUrl + '/admin/getOwnerlist?loggedInUser_Id=' + localStorage.getItem('currentUserId'), httpOptions).pipe(map((res: any) => { return res }))
    this.httpGetOptions.params = this.clearHttpParams('GET');
    return this.http.get(`${this.apiUrl}/admin/getOwnerlist`, this.httpGetOptions)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  changeOwner(ownerId, claimedstatus, restrtId) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(this.apiUrl + '/admin/changeOwner', { loggedInUser_Id: localStorage.getItem('currentUserId'), claimedstatus, ownerId, res_id: restrtId }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  changeOwnerPermission(editallow, restrtId) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(this.apiUrl + '/admin/changeOwnerPermission', { loggedInUser_Id: localStorage.getItem('currentUserId'), editallow, res_id: restrtId }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }
  addreservationSlot(options, restrtId, date) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(this.apiUrl + '/user/addResslot', { date, loggedInUser_Id: localStorage.getItem('currentUserId'), options, res_id: restrtId }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getResTimeSlots(restrtId) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(this.apiUrl + '/user/getResTimeSlots', { loggedInUser_Id: localStorage.getItem('currentUserId'), res_id: restrtId }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getSlot(restrtId, date) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(this.apiUrl + '/user/getResslot', { date, loggedInUser_Id: localStorage.getItem('currentUserId'), res_id: restrtId }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getReservationDetail(reservationId) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(this.apiUrl + '/user/getReservationDetail', { loggedInUser_Id: localStorage.getItem('currentUserId'), reservationId }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getDriverForOrder(orderId) {
    // return this.http.post(this.apiUrl + '/user/getDriverForOrder', { loggedInUser_Id: localStorage.getItem('currentUserId'), order_id }, httpOptions).pipe(map((res: any) => { return res }))
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(
      `${this.apiUrl}/user/getDriverForOrder`,
      { loggedInUser_Id: localStorage.getItem('currentUserId'), order_id: orderId },
      this.httpOptionsService.makeHttpRequestOptionsToObserveResponse(),
    ).pipe(
      map((res: any) => {
        console.log('response status', res.status);
        return res;
      }
      )
    );
  }

  verifyCode(code, orderid) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(this.apiUrl + '/user/checkCodeOfDriver', { loggedInUser_Id: localStorage.getItem('currentUserId'), code, orderid }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  usemenu(menuRestrtId, restrtId) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(this.apiUrl + '/user/usemenu', { loggedInUser_Id: localStorage.getItem('currentUserId'), use_res_id: menuRestrtId, res_id: restrtId }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  updateCookingTime(orderId, cookt) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(this.apiUrl + '/user/updateCookingTime', { loggedInUser_Id: localStorage.getItem('currentUserId'), order_id: orderId, cookt }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  uploadmenu(data) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    return this.http.post(`${this.apiUrl}/user/uploadmenu`, data, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  uploadinvQua(data) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    return this.http.post(`${this.apiUrl}/user/uploadinvQua`, data, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  deleteallmenu(restrtId) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(this.apiUrl + '/user/deleteallmenu', { loggedInUser_Id: localStorage.getItem('currentUserId'), res_id: restrtId }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  verifyUserCode(code, orderid) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(this.apiUrl + '/user/verifyUserCode', { loggedInUser_Id: localStorage.getItem('currentUserId'), code, orderid }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  updatePaymentStatus(orderid) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(this.apiUrl + '/user/updatePaymentStatus', { loggedInUser_Id: localStorage.getItem('currentUserId'), orderid }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  stopSearching(orderid) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(this.apiUrl + '/user/stop-searching', { loggedInUser_Id: localStorage.getItem('currentUserId'), orderid }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  saveDiscount(data) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    return this.http.post(`${this.apiUrl}/user/save-discount`, data, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getDiscount(restrtId) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(this.apiUrl + '/user/get-discount', { loggedInUser_Id: localStorage.getItem('currentUserId'), res_id: restrtId }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  deldis(discountId) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(this.apiUrl + '/user/del-discount', { loggedInUser_Id: localStorage.getItem('currentUserId'), discount_id: discountId }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  checkallowtoeditdiscount(restrtId) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(this.apiUrl + '/user/checkallowtoeditdiscount', { loggedInUser_Id: localStorage.getItem('currentUserId'), res_id: restrtId }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  saveStripeAccount(restrtId, stripeAcc) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(this.apiUrl + '/admin/saveStripeAccount', { loggedInUser_Id: localStorage.getItem('currentUserId'), res_id: restrtId, stripe_acc: stripeAcc }, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getInvoiceImages(index) {
    // return this.http.get(this.apiUrl + '/user/getInvoiceImage?index=' + index + "&loggedInUser_Id=" + localStorage.getItem("currentUserId"), httpOptions).pipe(
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('index', index);
    return this.http.get(`${this.apiUrl}/user/getInvoiceImage`, this.httpGetOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  saveAthAccount(restrtId: number, athAcc: string, athSecret: string) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http
      .post(
        this.apiUrl + "/admin/saveAthAccount",
        {
          loggedInUser_Id: localStorage.getItem("currentUserId"),
          res_id: restrtId,
          ath_acc: athAcc,
          ath_secret: athSecret,
        },
        this.httpPostOptionsWithDataOnly
      )
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }

  saveStripeFee(restrtId, stripeFee) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http
      .post(
        this.apiUrl + "/admin/saveStripFee",
        {
          // loggedInUser_Id: localStorage.getItem("currentUserId"),
          res_id: restrtId,
          stripe_fee: stripeFee
        },
        this.httpPostOptionsWithDataOnly
      )
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }

  saveEditor(data) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http
      .post(this.apiUrl + "/user/saveEditor",
        {
          loggedInUser_Id: localStorage.getItem("currentUserId"),
          ...data,
        },
        this.httpPostOptionsWithDataOnly
      )
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }

  getEditors() {
    // return this.http.get(this.apiUrl + `/user/getEditors?loggedInUser_Id=${localStorage.getItem("currentUserId")}`, httpOptions)
    this.httpGetOptions.params = this.clearHttpParams('GET');
    return this.http.get(`${this.apiUrl}/user/getEditors`, this.httpGetOptions)
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }

  deleteEditor(id) {
    // return this.http.get(this.apiUrl + `/user/deleteEditor?loggedInUser_Id=${localStorage.getItem("currentUserId")}&id=${id}`, httpOptions)
    this.httpGetOptions.params = this.clearHttpParams('GET', true).set('id', id);
    return this.http.get(`${this.apiUrl}/user/deleteEditor`, this.httpGetOptions)
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }

  getInventoryList(restid) {
    // const getrestorent = `${this.apiUrl}` + "/user/getuserrestaurants?loggedInUser_Id=" + localStorage.getItem("currentUserId");
    // this.httpGetOptions.params = this.requestQueryParams;
    const userid = parseInt(localStorage.getItem("currentUserId"), 10);
    this.httpGetOptions.params = this.clearHttpParams('GET');
    return this.http.get(`${this.apiUrl}/user/getinventorylist?restid=${restid}&userid=${userid}`, this.httpGetOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getInventoryListForItem(itemId) {
    const userid = parseInt(localStorage.getItem("currentUserId"), 10);
    this.httpGetOptions.params = this.clearHttpParams('GET');
    return this.http.get(`${this.apiUrl}/user/getinventorylistforitem?itemId=${itemId}&userid=${userid}`, this.httpGetOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getInventory(id) {
    const userid = parseInt(localStorage.getItem("currentUserId"), 10);
    this.httpGetOptions.params = this.clearHttpParams('GET');
    return this.http.get(`${this.apiUrl}/user/getinventory?userid=${userid}&inventoryId=${id}`, this.httpGetOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getEmployee(id) {
    const userid = parseInt(localStorage.getItem("currentUserId"), 10);
    this.httpGetOptions.params = this.clearHttpParams('GET');
    return this.http.get(`${this.apiUrl}/user/getEmployee?userid=${userid}&employeeUserId=${id}`, this.httpGetOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  getAllOrders(data, restrtId, userId) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY', true).set('res_id', restrtId).set('loggedInUser_Id', userId).set('userid', userId);
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http.post(this.apiUrl + '/user/getorders', data, this.httpPostOptionsWithDataOnly)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  createCustomer(data) {
    // const createRestaurantUrl = this.apiUrl + "/user/createRestaurant?loggedInUser_Id=" + localStorage.getItem("currentUserId");
    // this.httpPostOptionsWithDataOnly.params = this.requestQueryParams;
    this.httpPostOptionsWithDataAndFiles.params = this.clearHttpParams('POST-DATA-PLUS-FILES', true).set('userid', localStorage.getItem("currentUserId"));
    return this.http
      .post<any>(`${this.apiUrl}/user/createCustomer`, data, this.httpPostOptionsWithDataAndFiles)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  saveCustomer(data) {
    // const createRestaurantUrl = this.apiUrl + "/user/createRestaurant?loggedInUser_Id=" + localStorage.getItem("currentUserId");
    // this.httpPostOptionsWithDataOnly.params = this.requestQueryParams;
    this.httpPostOptionsWithDataAndFiles.params = this.clearHttpParams('POST-DATA-PLUS-FILES', true).set('userid', localStorage.getItem("currentUserId"));
    return this.http
      .put<any>(`${this.apiUrl}/user/saveCustomer`, data, this.httpPostOptionsWithDataAndFiles)
      .pipe(
        map((resp: any) => {
          return resp;
        })
      );
  }

  getCustomer(id) {
    const userid = parseInt(localStorage.getItem("currentUserId"), 10);
    this.httpGetOptions.params = this.clearHttpParams('GET');
    return this.http.get(`${this.apiUrl}/user/getCustomer?userid=${userid}&customerUserId=${id}`, this.httpGetOptions).pipe(
      map((resp: any) => {
        return resp;
      })
    );
  }

  saveTerminalQtyMaxLimit(restrtId: number, terminalQtyMaxLimit: number) {
    this.httpPostOptionsWithDataOnly.params = this.clearHttpParams('POST-DATA-ONLY');
    // TODO: test by removing loggedInUser_Id body field in the next line below
    return this.http
      .post(
        this.apiUrl + "/admin/saveTerminalInfo",
        {
          loggedInUser_Id: localStorage.getItem("currentUserId"),
          res_id: restrtId,
          terminal_qty_max_limit: terminalQtyMaxLimit // Add terminal_qty_max_limit to the request body
        },
        this.httpPostOptionsWithDataOnly
      )
      .pipe(
        map((res: any) => {
          return res;
        })
      );
  }

}
