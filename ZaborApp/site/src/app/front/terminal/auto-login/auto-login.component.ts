import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../shared/helpers/swalFunctionsData';
import {AuthenticationService} from '../../../shared/services/frontServices/authentication.service';
import {User} from '../../../shared/class/user';
import {Router} from '@angular/router';

@Component({
  // selector: 'app-auto-login',
  template: '<p>Wait! Now logging in...</p>'
  // styleUrls: ['./auto-login.component.scss']
})
export class AutoLoginComponent implements OnInit {

  constructor(private _router: Router, private _auth: AuthenticationService) { }

  ngOnInit() {
    this._auth.login({email: 'iosdeveloper0892@gmail.com', password: 'Test_12345'})
      .subscribe(
        res => {
          if (res.status) {
            this._router.navigate(['terminalTest/test']);
          } else {
            Swal.fire(Swaldata.SwalErrorToast(res.msg));
          }
        },
        error => {
          Swal.fire(Swaldata.SwalErrorToast("Something went wrong"));
        }
      );
  }

}
