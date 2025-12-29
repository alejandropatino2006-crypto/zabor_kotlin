import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
 


export function handleError(err) {

    if (err instanceof HttpErrorResponse) {
        if (err.status == 422 && err.error.errors.length > 0) {
            return throwError(err.error.errors[0].msg);
        }
        if (err.status == 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('currentuser');
            localStorage.removeItem('currentUserId');
            //this.route.navigate(['/login']);
        }
        else {

            return throwError("Something went wrong666");
        }
    } else {

        return throwError("Something went wrong777");
    }
}

