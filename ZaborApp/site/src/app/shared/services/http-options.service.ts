import { Injectable } from '@angular/core';
import { ClientStorageService } from './client-storage.service';
import { HttpHeaders, HttpParams } from '@angular/common/http';
import { MyDataTablesSettings, DatatablesNetConfig, DatatablesNetConfigColumns, DatatablesNetApi } from '../../../typings';

@Injectable({
  providedIn: 'root'
})
export class HttpOptionsService {

  constructor(private clientStorage: ClientStorageService, ) { }

  makeHttpRequestOptionsWithAuthentication() {
    const currentUserId = this.clientStorage.retrieveCurrentUserId();
    const token: string | null = this.clientStorage.retrieveToken();
    let ipAddress = this.clientStorage.retrieveIpAddress();
    if (ipAddress == null || ipAddress === "null") {
      ipAddress = "UNKNOWN";
    }
    return {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        'Client-Platform': `WEB`,
        'Client-IP': ipAddress,
        'Client-User-ID': String(currentUserId),
      }),
      observe: 'body' as const,
      responseType: 'json' as const,
    } as {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe?: 'body';
      params?: HttpParams | { [param: string]: string | string[] };
      reportProgress?: boolean;
      responseType: 'json';
      withCredentials?: boolean;
    };
  }

  makeHttpRequestOptionsWithoutAuthentication() {
    return {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      }),
      observe: 'body' as const,
      responseType: 'json' as const,
    } as {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe?: 'body';
      params?: HttpParams | { [param: string]: string | string[] };
      reportProgress?: boolean;
      responseType: 'json';
      withCredentials?: boolean;
    };
  }

  makeHttpRequestOptionsToObserveResponse() {
    return {
      headers: new HttpHeaders({
        "Content-Type": "application/json"
      }),
      observe: 'response' as const,
      responseType: 'json' as const,
    } as {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe: 'response';
      params?: HttpParams | { [param: string]: string | string[] };
      reportProgress?: boolean;
      responseType?: 'json';
      withCredentials?: boolean;
    };
  }

  makeHttpRequestGetOptions() {
    return {
      headers: new HttpHeaders({
        Accept: "application/json",
      }),
      observe: 'body' as const,
      responseType: 'json' as const,
    } as {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe?: 'body';
      params?: HttpParams | { [param: string]: string | string[] };
      reportProgress?: boolean;
      responseType: 'json';
      withCredentials?: boolean;
    };
  }

  makeHttpRequestPostOptionsWithDataOnly() {
    return {
      headers: new HttpHeaders({
        Accept: "application/json",
        "Content-Type": "application/json",
      }),
      observe: 'body' as const,
      responseType: 'json' as const,
    } as {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe?: 'body';
      params?: HttpParams | { [param: string]: string | string[] };
      reportProgress?: boolean;
      responseType: 'json';
      withCredentials?: boolean;
    };
  }

  makeHttpRequestPostOptionsWithDataAndFiles() {
    return {
      headers: new HttpHeaders({
        Accept: "application/json",
        // "Content-Type": "application/json",
      }),
      observe: 'body' as const,
      responseType: 'json' as const,
    } as {
      headers?: HttpHeaders | { [header: string]: string | string[] };
      observe?: 'body';
      params?: HttpParams | { [param: string]: string | string[] };
      reportProgress?: boolean;
      responseType: 'json';
      withCredentials?: boolean;
    };
  }

  makeDefaultGridOptions() {
    return {
      destroy: true,
      ordering: true,
      paging: true,
      searching: false,
      processing: true,
      // "select": false,
      // "lengthMenu": [ [10, 15, 25, 35, 50, -1], [10, 15, 25, 35, 50, "All"] ],
      lengthMenu: [
        [50, 100, 250, -1],
        [50, 100, 250, "All"],
      ],
      // dom: 'Blfrtip',
      // dom: 'litrp',
      // dom: '<"wrapper"flipt>',
      // dom: '<lf<t>ip>',
      dom: '<"container-fluid d-flex flex-row justify-content-between"li>rt<"clear mb-3"><"container-fluid d-flex flex-row justify-content-between"pf>',
      scrollCollapse: true,
      // layout: {
      //   topStart: 'info',
      //   topEnd: {
      //     search: {
      //       placeholder: 'Search'
      //     }
      //   }
      // },
      pagingType: 'full_numbers',
      language: {
        // https://datatables.net/reference/option/language
        emptyTable: "No data available",
        // "info": "Showing [_START_ .. _END_] of _TOTAL_ entries",
        loadingRecords: "Loading data now! wait...",
        // "lengthMenu": "Displayed number of entries _MENU_",
        // "searchPlaceholder": "Search records",
        // "search": "Search:",
        // "paginate": {
        //   "first": "&lt;&lt;",
        //   "next": '<i class="fa fa-fw fa-long-arrow-right">',
        //   "previous": '<i class="fa fa-fw fa-long-arrow-left">',
        //   "last": "&gt;&gt;"
        // }
      },
    // } as DataTables.Settings;
    // } as DatatablesNetConfig;
    } as MyDataTablesSettings;
  }
}
