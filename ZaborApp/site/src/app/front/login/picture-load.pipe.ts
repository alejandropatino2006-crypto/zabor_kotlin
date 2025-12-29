import { Pipe, PipeTransform } from '@angular/core';
import {Observable} from 'rxjs';
import {HttpBackend, HttpClient, HttpHeaders} from '@angular/common/http';

@Pipe({
  name: 'pictureLoad'
})
export class PictureLoadPipe implements PipeTransform {

  public static BLANK_IMAGE = 'data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==';

  private http: HttpClient;

  constructor(private handler: HttpBackend) {
    this.http = new HttpClient(handler);
  }

  transform(url: string, defaultUrl: string) {
    return new Observable<string>((observer) => {
      observer.next(PictureLoadPipe.BLANK_IMAGE);
      // observer.next(defaultUrl);
      const {next, error} = observer;

      const headers = new HttpHeaders({ 'Content-Type': 'image/*' });
      return this.http.get(url, {headers: headers, responseType: 'blob'}).subscribe(
        response => {
          // console.log('IMAGE DOWNLOADED...');
          const reader = new FileReader();
          reader.readAsDataURL(response);
          reader.onloadend = function() {
            observer.next(reader.result as string);
          };
          reader.onerror = function () {
            const err = reader.error;
            console.error('ERR-PIC', err);
            // console.error(`image load error: ${err.name} -< ${err.message}`);
            observer.error(err);
          };
        },
        err => {
          console.error('ERR-IMG-REQ', err);
          // observer.error(err);
          observer.next(defaultUrl);
        }
      );
    });
  }

}
