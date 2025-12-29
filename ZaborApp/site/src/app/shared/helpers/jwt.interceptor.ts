import { Injectable } from '@angular/core';
import { HttpClient, HttpEvent, HttpHandler, HttpHeaders, HttpInterceptor, HttpParams, HttpRequest } from '@angular/common/http';
import { from, Observable } from 'rxjs';
import { filter, switchMap, take } from 'rxjs/operators';

import { ClientStorageService } from '../services/client-storage.service';
import { environment } from '../../../environments/environment';

function isValidIP(txt: string) {
  return /^(?!0)(?!.*\.$)((1?\d?\d|25[0-5]|2[0-4]\d)(\.|$)){4}$/.test(txt);
}

function in_array(needle: string | number | boolean, haystack: string[] | number[] | boolean[], strict = false) {
  // we prevent the double check (strict && arr[key] === ndl) || (!strict && arr[key] === ndl)
  // in just one for, in order to improve the performance
  // deciding wich type of comparation will do before walk array
  if (strict) {
    for (const key in haystack) {
      if (haystack[key] === needle) {
        return true;
      }
    }
  } else {
    for (const key in haystack) {
      // tslint:disable-next-line:triple-equals
      if (haystack[key] == needle) { // eslint-disable-line eqeqeq
        return true;
      }
    }
  }
  return false;
}

const mainRoutes = ['owner', 'admin', 'pos', 'employee', 'user', 'api'];
const exemptPaths = ['testfcm', 'getadverts'];

@Injectable()
export class JwtInterceptor implements HttpInterceptor {

    constructor(private http: HttpClient, private clientStorage: ClientStorageService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      // console.log('intercepting request >', request.url);

      // const currentUser: object | null = this.clientStorage.retrieveCurrentUser();
      const currentUserId: number | null = this.clientStorage.retrieveCurrentUserId();
      const token: string | null = this.clientStorage.retrieveToken();

      if (request.url.indexOf(environment.apiUrl) > -1) {
        const url = request.url.replace(environment.apiUrl + '/', '');
        const urlParts = url.split('/');
        // console.log('parts-0', urlParts[0]);
        // console.log('parts-1', urlParts[1]);
        // if (token != null) { console.log('TEST', in_array(urlParts[0], mainRoutes)); }
        if (token != null && in_array(urlParts[0], mainRoutes) && !in_array(urlParts[1], exemptPaths)) {
          // console.log('adding authentication header >', request.url, request.headers.get('useCustomHeaders'));
          // const cloned = request.clone({
          //   setHeaders: {
          //     // Authorization: `Bearer ${token}`,
          //     'Client-Platform': `WEB`,
          //   }
          // });
          // return next.handle(cloned);
          return this.getIPAddressAndLocation().pipe(
            filter(r => r != null),
            take(1),
            switchMap(({ip}: { ip: string }, index) => {
              // const newParams = new HttpParams({fromString: request.params.toString()});
              // console.log('TEST', request.urlWithParams, newParams);
              const headers = {
                  Authorization: `Bearer ${token}`,
                  'Client-Platform': `WEB`,
                  'Client-IP': ip,
                  'Client-User-ID': String(currentUserId),
              };
              if (urlParts[1] === 'change-password') {
                return next.handle(request.clone({
                  setHeaders: headers,
                }));
              }
              // console.log('TEST-p', request.params, request.params.has('loggedInUser_Id'));
              const toClone = {
                setHeaders: headers,
                // // params: newParams,
                // setParams: {
                //   loggedInUser_Id: this.clientStorage.retrieveCurrentUserIdAsString(),
                // },
              } as {
                headers?: HttpHeaders;
                reportProgress?: boolean;
                params?: HttpParams;
                responseType?: 'arraybuffer' | 'blob' | 'json' | 'text';
                withCredentials?: boolean;
                body?: any | null;
                method?: string;
                url?: string;
                setHeaders?: {
                  [name: string]: string | string[];
                };
                setParams?: {
                  [param: string]: string;
                };
              };
              if (!request.params.has('loggedInUser_Id')) {
                toClone.setParams = {
                  loggedInUser_Id: this.clientStorage.retrieveCurrentUserIdAsString(),
                };
              }
              const cloned = request.clone(toClone);
              // console.log('TEST-c', cloned.urlWithParams);
              return next.handle(cloned);
            })
          );
        // } else {
        //   // if (currentUser == null) {console.error('running request without user');}
        //   // if (token == null) {console.error('running request without token');}
        //   return next.handle(request);
        }
      }
      return next.handle(request);
    }

    private getIPAddressAndLocation(): Observable<{ip: string}> {
        const ipAddressPromise = () =>
          new Promise<{ip: string}>((resolve) => {
              const ipAddress = this.clientStorage.retrieveIpAddress();
              if (ipAddress != null) {
                  return resolve({ ip: ipAddress });
              } else {
                const init: RequestInit = {
                  method: 'GET', // *GET, POST, PUT, DELETE, etc.
                  mode: 'cors', // no-cors, *cors, same-origin
                  cache: 'no-store', // *default, no-cache, reload, force-cache, only-if-cached
                  credentials: 'same-origin', // include, *same-origin, omit
                  headers: {
                    // 'Content-Type': 'application/text',
                    'Content-Type': 'text/plain; charset=utf-8',
                  },
                  redirect: 'follow', // manual, *follow, error
                  referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
                };
                // const url = 'https://api.ipify.org/?format=json';
                const url = 'https://myexternalip.com/raw';
                fetch(url, init).then(
                  response => {
                    response.text().then(
                      ipString => {
                        if (isValidIP(ipString) && ipString.length > 13) {
                          this.clientStorage.storeIpAddress(ipString);
                          return resolve({ip: ipString});
                        } else {
                          console.log("Invalid IP: " + url + " --> " + ipString);
                          return resolve({ip: 'UNKNOWN'});
                        }
                      },
                      errorString => {
                        console.log("text(): " + url + " --> " + errorString);
                        return resolve({ip: 'UNKNOWN'});
                      }
                    );
                  },
                  reason => {
                    console.log("Fetch Error: " + url + " --> " + reason);
                    return resolve({ip: 'UNKNOWN'});
                  }
                );
              }
          });

        // the execution of ipAddressPromise() starts here, when you create the promise inside from
        return from(ipAddressPromise());
    }

}
