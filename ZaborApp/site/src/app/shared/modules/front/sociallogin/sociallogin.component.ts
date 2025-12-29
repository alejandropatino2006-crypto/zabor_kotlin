import { Component, OnInit } from '@angular/core';
import { AuthService } from "angularx-social-login";
import { FacebookLoginProvider, GoogleLoginProvider } from "angularx-social-login";
import { AuthenticationService } from '../../../services/frontServices/authentication.service';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../../shared/helpers/swalFunctionsData';
import { NgxSpinnerService } from 'ngx-spinner';
import { UserService } from 'src/app/shared/services/frontServices/user.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-sociallogin',
  templateUrl: './sociallogin.component.html'
})
export class SocialloginComponent implements OnInit {


  constructor(private _router: Router,
    private _auth: AuthenticationService,
    private spinner: NgxSpinnerService,
    private userService: UserService,
    private authService: AuthService,
    private translate: TranslateService,
  ) { }

  signInWithGoogle(): void {
    this.authService.signIn(GoogleLoginProvider.PROVIDER_ID).then(x => {

      if (x.id) {
        this.spinner.show()
        this._auth.socialLogin({ email: x.email, role: 'user', name: x.name, google_token: x.authToken }).subscribe(res => {
          if (res.status) {
            Swal.fire(Swaldata.SwalSuccessToast("Login Successfully"));
            this.userService.Setuserdata()
            this._router.navigate(['/']);
          } else {
            Swal.fire(Swaldata.SwalErrorToast(res.msg));
          }
        }, err => {
          Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
        }
        ).add(() => {
          this.spinner.hide()
        })
      }
    });
  }

  signInWithFB() {
    this.authService.signIn(FacebookLoginProvider.PROVIDER_ID).then(x => { 
      if (x.id) {
        this.spinner.show()
        this._auth.socialLogin({ email: x.email, role: 'user', name: x.name, fb_token: x.authToken }).subscribe(res => {
          if (res.status) {
            Swal.fire(Swaldata.SwalSuccessToast("Login Successfully"));
            this.userService.Setuserdata()
            this._router.navigate(['/']);
          } else {
            Swal.fire(Swaldata.SwalErrorToast(res.msg));
          }
        }, err => {
          Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
        }
        ).add(() => {
          this.spinner.hide()
        })
      }
    });
  }

  ngOnInit() {
  }

  signOut(): void {
    this.authService.signOut();
  }
}
