import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { slideToBottom } from "../../router.animations";
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthenticationService } from '../../shared/services/frontServices/authentication.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as Swaldata from '../../shared/helpers/swalFunctionsData';
import { UserService } from 'src/app/shared/services/frontServices/user.service';
import {AppService} from '../../shared/services/app.service';
import {environment} from '../../../environments/environment';
import {PictureLoadPipe} from './picture-load.pipe';
import { FbAuthService } from '../../shared/services/fb-auth.service';
import { Observable } from 'rxjs';
import { FbFcmService } from '../../shared/services/fb-fcm.service';
import { ClientStorageService } from '../../shared/services/client-storage.service';

declare var $: any;

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent implements OnInit {
  private static defaultBackgroundImageFilenameOnApiServer = 'webdata/login-bg.jpg';

  loginForm: FormGroup;
  submitted = false;
  public errorMessage: string;
  public leftBackgroundImagePath = PictureLoadPipe.BLANK_IMAGE;
  passwordFieldType = 'password';

  usingFirebaseAuth = false; // environment.usingFirebaseAuth;

  constructor(private _router: Router,
    private _auth: AuthenticationService,
    private formBuilder: FormBuilder,
    private spinner: NgxSpinnerService,
    private userService: UserService,
    private appService: AppService,
    private fbAuthService: FbAuthService,
    // private fbFcmService: FbFcmService,
    private clientStorage: ClientStorageService,
  ) { }


  ngOnInit() {
    // this.spinner.show();
    // Check if user already logged In
    this.errorMessage = '';
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    })

    $('body').addClass('nonepadding');

    // initialize with default image
    let backgroundImageFilename = LoginComponent.defaultBackgroundImageFilenameOnApiServer;
    this.appService.getAnonymousUserSettings().subscribe({
      next: (data: any) => {
        if (data.status) {
          // check and set image from settings saved on API
          if (data.data.loginPic != null) {
            backgroundImageFilename = data.data.loginPic;
          }

          // finally set the image (this will be an image from API or default image)
          this.leftBackgroundImagePath = environment.apiUrl + '/' + backgroundImageFilename;
        }
      },
      error(err: any) {
        console.error('ERR-LOGIN-IMG', err);
      }
    });
  }


  onSubmit() {
    // stop here if form is invalid
    if (this.loginForm.invalid) {
      return;
    }

    // this.fbAuthService.signup(this.loginForm.value.email, this.loginForm.value.password)
    //   .then((user) => {
    //     console.log(user);
    //   })
    //   .catch((err) => {
    //     console.error('error while signup with email and password', err);
    //   });

    const formValue = this.loginForm.value;
    if (this.usingFirebaseAuth) {
      this.fbAuthService.login(formValue.email, formValue.password)
        .then(async (user) => {
          await this.doLoginAlongWithFirebase(formValue, user);
        })
        .catch((err) => {
          console.error('error while login with email and password', err);
          if (err.code === 'auth/user-not-found') {
            Swal.fire(Swaldata.SwalWarnToast('Wait while we update your account...'));
            this.fbAuthService.signup(formValue.email, formValue.password)
              .then(async (user) => {
                await this.doLoginAlongWithFirebase(formValue, user);
              })
              .catch((error) => {
                console.error('error while signup with email and password', error);
                Swal.fire(Swaldata.SwalErrorToast('Account updated error'));
              });
          } else if (err.code === 'auth/too-many-requests') {
            Swal.fire(Swaldata.SwalErrorToast('Server is busy! Wait for some time and try again.'));
          } else if (err.code === 'auth/wrong-password') {
            Swal.fire(Swaldata.SwalErrorToast('Invalid email or password'));
          } else {
            Swal.fire(Swaldata.SwalErrorToast('Something went wrong'));
          }
        });
    } else {
      if (this.clientStorage.retrieveFcmToken() != null) {
        formValue['fcm_token'] = this.clientStorage.retrieveFcmToken();
      }
      this.doSubmit(formValue);
    }
  }

  private doLoginAlongWithFirebase = async (formValue, user) => {
    // console.log(user);
    // console.log('fcm user:', user.user);
    // console.log(user.user.uid);
    const fbUser = await this.fbAuthService.getCurrentUser();
    fbUser.getIdToken()
      .then((token) => {
        if (token == null || token.trim().length === 0) {
          console.error('Firebase ID Token is null');
          return;
        }

        // this.fbFcmService.requestPermissionAndGetToken();

        // console.log('the id token is', token);
        console.log('the id token length is', token.length);
        // this.onSubmit(user.user.uid, token);

        formValue['external_login_type'] = 'firebase';
        formValue['firebase_uid'] = user.user.uid;
        formValue['firebase_token'] = token;

        // formValue['fcm_token'] = 'fcmToken';this.doSubmit(formValue);

        // setTimeout(() => {
        //   this.fbFcmService.getToken()
        //     .then((fcmToken) => {
        //       // console.log('the fcm token is', fcmToken);
        //       console.log('the fcm token length is', fcmToken.length);
        //       formValue['fcm_token'] = fcmToken;
        //
        //       this.doSubmit(formValue);
        //     })
        //     .catch((err) => {
        //       console.error('Error while getting FCM token', err);
        //     });
        // }, 2000);
      })
      .catch((err) => {
        console.error('Error refreshing id token', err);
      });
  };

  private doSubmit = (formValue: any) => {
    this.spinner.show();
    this.submitted = true;
    let loginObservable: Observable<any>;
    if (this.usingFirebaseAuth) {
      loginObservable = this._auth.loginWithFirebase(formValue);
    } else {
      loginObservable = this._auth.login(formValue);
    }
    loginObservable
      .subscribe(
        res => {
          if (res.status) {
            Swal.fire(Swaldata.SwalSuccessToast('Login Successfully'));
            this.userService.Setuserdata();
            this._router.navigate(['/']);
          } else {
            Swal.fire(Swaldata.SwalErrorToast(res.msg));
          }
        },
        error => {
          Swal.fire(Swaldata.SwalErrorToast('Something went wrong'));
        }
      ).add(() => {
      this.spinner.hide();
    });
  };

  // setDefaultBackgroundImage() {
  //   LoginComponent.leftBackgroundImageErrorCount++;
  //   if (LoginComponent.leftBackgroundImageErrorCount > 1) {
  //     this.leftBackgroundImagePath = `assets/images/login-bg.jpg`;
  //   }
  // }

  handlePasswordToggle(evt: MouseEvent) {
    evt.preventDefault();
    const currentlyHidden = this.passwordFieldType === 'password';
    this.passwordFieldType = currentlyHidden ? 'text' : 'password';
  }
}
