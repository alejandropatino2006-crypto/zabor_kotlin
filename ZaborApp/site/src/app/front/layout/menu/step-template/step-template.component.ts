import {AfterViewInit, Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
// import {StepsService} from '../steps.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {addressValidator, MustMatch, noOnlyWhitespaceNotRequiredValidator, noOnlyWhitespaceValidator, passcodeValidator} from '../../../../shared/helpers/custom.validator';
import {AuthenticationService} from '../../../../shared/services/frontServices/authentication.service';
import {NgxSpinnerService} from 'ngx-spinner';
import {RestaurantService} from '../../../../shared/services/frontServices/restaurant.service';
import Swal from 'sweetalert2';
import {SwalErrorToast, SwalSuccessToast, SwalWarnToast} from '../../../../shared/helpers/swalFunctionsData';
import {Router} from '@angular/router';
import * as Swaldata from '../../../../shared/helpers/swalFunctionsData';
import {UserService} from '../../../../shared/services/frontServices/user.service';
import {StepModel} from '../../../../shared';
import {RegistrationStepsService} from '../registration-steps.service';
import {LoginStepsService} from '../login-steps.service';

@Component({
  selector: 'app-step-template',
  templateUrl: './step-template.component.html',
  styleUrls: ['./step-template.component.scss']
})
export class StepTemplateComponent implements OnInit, AfterViewInit {

  private static showRegisterForm = true;

  @Output() changeStepsType = new EventEmitter<'register' | 'login'>();

  @Input() step: StepModel;
  registerForm: FormGroup;
  passcodeForm: FormGroup;

  stepHeading: string;
  @ViewChild('registerFormWrapper', { static: true }) registerFormWrapperTemplate: TemplateRef<any>;
  @ViewChild('loginFormWrapper', { static: true }) loginFormWrapperTemplate: TemplateRef<any>;
  loginForm: FormGroup;
  stepNumber = '1';

  // tslint:disable-next-line:max-line-length
  // constructor(private router: Router, private spinner: NgxSpinnerService, private _fb: FormBuilder, private _auth: AuthenticationService, private stepsService: StepsService, private restaurantservice: RestaurantService, private userService: UserService) { }
  // tslint:disable-next-line:max-line-length
  constructor(private router: Router, private spinner: NgxSpinnerService, private _fb: FormBuilder, private _auth: AuthenticationService, private registrationStepsService: RegistrationStepsService, private loginStepsService: LoginStepsService, private restaurantservice: RestaurantService, private userService: UserService) { }

  ngOnInit(): void {
    this.stepHeading = 'Signup';
    if (this.step.stepIndex === 1) {
      this.registerForm = this._fb.group({
          firstname: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
          middlename: ['', [noOnlyWhitespaceNotRequiredValidator, Validators.maxLength(25)]],
          lastname: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
          country: ['', [Validators.required, Validators.maxLength(25)]],
          phone: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(15), Validators.pattern('[0-9\+\-\]+'), Validators.minLength(10)]],
          city: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
          state: ['', [Validators.required, noOnlyWhitespaceValidator, Validators.maxLength(25)]],
          pincode: ['', [Validators.pattern('^[0-9]{4,8}$')]],
          // houseno: ['', [noOnlyWhitespaceNotRequiredValidator, Validators.maxLength(25)]],
          address: ['', [addressValidator, Validators.maxLength(512)]],
          email: ['', [Validators.required, Validators.email]],
          password: ['', [Validators.required, Validators.minLength(8)]],
          confirmPassword: ['', [Validators.required, Validators.minLength(8)]]
        },
        {
          validator: MustMatch("password", "confirmPassword")
        }
      );
      this.loginForm = this._fb.group({
          email: ['', [Validators.required, Validators.email]],
          password: ['', [Validators.required, Validators.minLength(8)]],
        }
      );
    }
    if (this.step.stepIndex === 2) {
      this.passcodeForm = this._fb.group({
        passcode: ['', [Validators.required, passcodeValidator, Validators.minLength(6), Validators.maxLength(6)]],
      });
    }

  }

  onCompleteStep() {
    this.step.isComplete = true;
  }

  private createFullname(firstname: string, middlename: string | null, lastname: string) {
    if (middlename != null && middlename.length > 0) {
      return firstname + ' ' + middlename + ' ' + lastname;
    }

    return firstname + ' ' + lastname;
  }

  onRegisterSubmit() {
    if (!this.registerForm.valid) {
      alert('invalid');
      return;
    }

    // this.spinner.show();

    const data = this.registerForm.value;
    data["role"] = "user";
    data["usePasscode"] = true;
    data['preflang'] = 'en';
    data['name'] = this.createFullname(data.firstname, data.middlename, data.lastname);
    console.log('data', data);
    // alert(JSON.stringify(data));
    // this.onNextStep();
    this._auth.register(data).subscribe(
      response => {
        if (response.status) {
          data['user_id'] = response.data.user_id;
          localStorage.setItem('new_checkout_user', JSON.stringify(data));
          Swal.fire(Swaldata.SwalSuccessToast("Registration successful and activation mail send to your provided email address"));
          this.onNextStep();
        } else {
          Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
        }
      },
      error => {
        Swal.fire(Swaldata.SwalErrorToast(error));
      }
    ).add(() => {
      this.spinner.hide();
    });

    // this.userService.addAddress(data).subscribe(
    //   data => {
    //     if (data.status) {
    //       Swal.fire(Swaldata.SwalSuccessToast(data.msg));
    //     } else {
    //       Swal.fire(Swaldata.SwalErrorToast('Something Went Wrong'));
    //     }
    //   },
    //   err => {
    //     Swal.fire(Swaldata.SwalErrorToast('Something Went Wrong'));
    //   }
    // ).add(() => {
    //   this.spinner.hide()
    // })
  }

  handleCancelLogin() {
    (<any>$('#loginUserModal')).modal('hide');
    if (StepTemplateComponent.showRegisterForm) {
      if (this.step.stepIndex > 1) {
        const userData = JSON.parse(localStorage.getItem('new_checkout_user'));
        localStorage.removeItem('new_checkout_user');
        this._auth.deleteUser({user_id: userData.user_id}).subscribe(
          response => {
            if (response.status) {
              if (this.step.stepIndex === 3) {
                this.userService.deleteAddress({id: userData.address_id, user_id: userData.user_id}).subscribe(
                  responseData => {
                    this.registrationStepsService.moveToPreviousStep();
                    this._auth.logoutNoNavigation();
                  }
                );
              }
              this.registrationStepsService.moveToPreviousStep();
            } else {
              Swal.fire(Swaldata.SwalErrorToast(response.msg));
            }
          },
          error => {
            Swal.fire(Swaldata.SwalErrorToast(error));
          }
        );
      }
    } else {
      if (this.step.stepIndex > 1) {
        // window.location.reload();
        const parser = new URL(window.location.href);
        parser.searchParams.set('shouldAddItemsAgain', 'true');
        window.location.href = parser.href;
      }
    }
  }

  onNextStep() {
    if (StepTemplateComponent.showRegisterForm) {
      if (!this.registrationStepsService.isLastStep()) {
        this.registrationStepsService.moveToNextStep();
        if (this.registrationStepsService.currentStep$.value.stepIndex === 2) {
          this.stepHeading = 'Passcode';
          this.stepNumber = '2';
        }
        if (this.registrationStepsService.currentStep$.value.stepIndex === 3) {
          this.stepHeading = 'Checkout';
          this.stepNumber = '3';
        }
      }
    } else {
      if (!this.loginStepsService.isLastStep()) {
        this.loginStepsService.moveToNextStep();
        if (this.loginStepsService.currentStep$.value.stepIndex === 2) {
          alert('test');
          this.stepHeading = 'Checkout';
          this.stepNumber = '2';
        }
      }
    }
    // if (!this.stepsService.isLastStep()) {
    //   this.stepsService.moveToNextStep();
    //   if (StepTemplateComponent.showRegisterForm) {
    //     if (this.stepsService.currentRegisterStep$.value.stepIndex === 2) {
    //       this.stepHeading = 'Passcode';
    //       this.stepNumber = '2';
    //     }
    //     if (this.stepsService.currentRegisterStep$.value.stepIndex === 3) {
    //       this.stepHeading = 'Checkout';
    //       this.stepNumber = '3';
    //     }
    //   } else {
    //     if (this.stepsService.currentLoginStep$.value.stepIndex === 2) {
    //       alert('test');
    //       this.stepHeading = 'Checkout';
    //       this.stepNumber = '2';
    //     }
    //   }
    // } else {
    //   alert('last');
    //   // this.onSubmit();
    // }
  }

  onPasscodeSubmit() {
    if (!this.passcodeForm.valid) {
      alert('invalid');
      return;
    }

    this.spinner.show();

    const formData = this.passcodeForm.value;
    // console.log('data', formData);
    // console.log('passcode', formData.passcode);
    // console.log('passcode type', (typeof formData.passcode));
    // localStorage.setItem('new_checkout_user_passcode', formData.passcode);
    const userData = JSON.parse(localStorage.getItem('new_checkout_user'));
    // alert(JSON.stringify(data));
    // this.onNextStep();
    this._auth.verifyEmailPasscode(userData.email, formData.passcode).subscribe(
      response => {
        if (response.status) {
          Swal.fire(Swaldata.SwalSuccessToast("Email verified successfully!"));
        } else {
          Swal.fire(Swaldata.SwalErrorToast(response.msg));
        }
      },
      error => {
        Swal.fire(Swaldata.SwalErrorToast(error));
      }
    ).add(() => {
      this._auth.login({email: userData.email, password: userData.password})
        .subscribe(
          res => {
            if (res.status) {
              const {password, confirmPassword, middlename, name, preflang, role, usePasscode, ...data} = userData;
              data.firstname = userData.firstname + ' ' + userData.middlename;
              data.lng = 1;
              data.lat = 1;
              data.formattedAddress = '-';
              data.houseno = '-';
              data.id = -1;
              this.userService.addAddress(data).subscribe(
                response => {
                  if (response.status) {
                    userData['address_id'] = response.insertId;
                    localStorage.setItem('new_checkout_user', JSON.stringify(userData));
                    // Swal.fire(Swaldata.SwalSuccessToast(response.msg));
                    this.onNextStep();
                  } else {
                    Swal.fire(Swaldata.SwalErrorToast('Something Went Wrong'));
                  }
                },
                err => {
                  Swal.fire(Swaldata.SwalErrorToast('Something Went Wrong'));
                }
              ).add(() => {
                this.spinner.hide();
              });
            } else {
              Swal.fire(Swaldata.SwalErrorToast(res.msg));
            }
          },
          error => {
            Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
          }
        );
    });
  }

  proceedToCheckout() {
    (<any>$('#loginUserModal')).modal('hide');
    // this.router.navigate(['checkout', 'autologin']);
    const cart = this.restaurantservice.cart;
    cart['user_id'] = parseInt(localStorage.getItem('currentUserId'), 10);
    console.log('cart', cart);
    this.spinner.show();
    this.restaurantservice.updateCart({ ...cart }).subscribe(
      response => {
        if (response.status) {
          Swal.fire(SwalSuccessToast(response.msg));
          cart['cart_id'] = response.insertId;
          this.restaurantservice.cart = cart;
          localStorage.removeItem('new_checkout_user');
          this.router.navigate(['checkout'])
            .then(() => {
              window.location.reload();
            });
        } else {
          Swal.fire(SwalErrorToast(response.msg));
        }
      },
      err => {
        Swal.fire(SwalErrorToast('Something went wrong'));
      }
    ).add(() => {
      this.spinner.hide();
    });
  }

  getStep1Template() {
    this.stepHeading = StepTemplateComponent.showRegisterForm ? 'Signup' : 'Login';
    return StepTemplateComponent.showRegisterForm ? this.registerFormWrapperTemplate : this.loginFormWrapperTemplate;
  }

  doLogin(e: MouseEvent) {
    e.preventDefault();
    // this.stepsService.setSteps(StepTemplateComponent.LOGIN_STEPS);
    // alert('show login dialog use ngTemplateOutlet >>> \nhttps://www.youtube.com/watch?v=TZZApWysF9g');
    this.changeStepsType.emit('login');
    StepTemplateComponent.showRegisterForm = false;
  }

  doRegister() {
    // this.stepsService.setSteps(StepTemplateComponent.REGISTER_STEPS);
    this.changeStepsType.emit('register');
    StepTemplateComponent.showRegisterForm = true;
  }

  onLoginSubmit() {
    if (!this.loginForm.valid) {
      alert('invalid');
      return;
    }

    this.spinner.show();

    this._auth.login(this.loginForm.value)
      .subscribe(
        res => {
          if (res.status) {
            Swal.fire(Swaldata.SwalSuccessToast("Login Successful!!!"));
            this.userService.Setuserdata();
            // this.onNextStep();
            // this.stepHeading = 'Checkout';
            // this.stepNumber = '2';
            this.onNextStep();
            this.stepHeading = 'Checkout';
            this.stepNumber = '2';
          } else {
            Swal.fire(Swaldata.SwalErrorToast(res.msg));
          }
        },
        error => {
          Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
        }
      ).add(() => {
      this.spinner.hide();
    });
  }

  ngAfterViewInit(): void {
    // this.stepsService.setup('register');
    // this.changeStepsType.emit('register');
  }

}
