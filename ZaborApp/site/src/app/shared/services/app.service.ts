import { Injectable } from '@angular/core';
import { UserService } from './user.service';
import {map} from 'rxjs/operators';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AppService {
  static httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
    })
  };

  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) { }

  public getAnonymousUserSettings() {
    return this.http.get<any>(`${this.apiUrl}` + '/api/anonymousUserSettings', AppService.httpOptions).pipe(map((resp: any) => resp));
  }

  public use(adminUserService: UserService, ): Promise<{}> {
    return new Promise<{}>((resolve, reject) => {

      let userCount = 0;
      const isAdminPage = location.toString().split('/admin').length > 1; // location.origin +

      if (isAdminPage && localStorage.getItem('adminUser')) {
        userCount++;

      if (userCount === 0) {
        resolve('Done');
      }

      }
    });
  }
}
