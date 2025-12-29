import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {StepModel} from '../../../../shared';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {Router} from '@angular/router';
import {NgxSpinnerService} from 'ngx-spinner';
import {AuthenticationService} from '../../../../shared/services/frontServices/authentication.service';
import {RegistrationStepsService} from '../registration-steps.service';
import {LoginStepsService} from '../login-steps.service';
import {RestaurantService} from '../../../../shared/services/frontServices/restaurant.service';
import {UserService} from '../../../../shared/services/frontServices/user.service';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../../shared/helpers/swalFunctionsData';
import {SwalErrorToast, SwalSuccessToast} from '../../../../shared/helpers/swalFunctionsData';

@Component({
  selector: 'app-login-step-template',
  templateUrl: './login-step-template.component.html',
  styleUrls: ['./login-step-template.component.scss']
})
export class LoginStepTemplateComponent implements OnInit {

  @Output() changeStepsType = new EventEmitter<'register' | 'login'>();

  @Input() step: StepModel;
  loginForm: FormGroup;
  // stepHeading: string;
  // stepNumber = '1';

  // tslint:disable-next-line:max-line-length
  constructor(private router: Router, private spinner: NgxSpinnerService, private _fb: FormBuilder, private _auth: AuthenticationService, private loginStepsService: LoginStepsService, private restaurantservice: RestaurantService, private userService: UserService) { }

  ngOnInit() {
    // this.stepHeading = 'Login';
    if (this.step.stepIndex === 1) {
      this.loginForm = this._fb.group({
          email: ['', [Validators.required, Validators.email]],
          password: ['', [Validators.required, Validators.minLength(8)]],
        }
      );
    }
  }

  handleCancelLogin() {
    (<any>$('#loginUserModal')).modal('hide');
    if (this.step.stepIndex > 1) {
      // window.location.reload();
      const parser = new URL(window.location.href);
      parser.searchParams.set('shouldAddItemsAgain', 'true');
      window.location.href = parser.href;
    }
  }

  onNextStep() {
    if (!this.loginStepsService.isLastStep()) {
      this.loginStepsService.moveToNextStep();
      // if (this.loginStepsService.currentStep$.value.stepIndex === 2) {
      //   this.stepHeading = 'Checkout';
      //   this.stepNumber = '2';
      // }
    }
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
            // this.stepHeading = 'Checkout';
            // this.stepNumber = '2';
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

  doRegister(e: MouseEvent) {
    e.preventDefault();
    this.changeStepsType.emit('register');
  }

}
