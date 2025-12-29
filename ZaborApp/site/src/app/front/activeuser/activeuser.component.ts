import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/shared/services/user.service';

@Component({
  selector: 'app-activeuser',
  templateUrl: './activeuser.component.html',
  styleUrls: ['./../resetpassword/resetpassword.component.scss']
})
export class ActiveuserComponent implements OnInit {
  token: string;
  email: string;
  successfullyactive: boolean;
  msg: string = '';

  constructor(private userService: UserService, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    $('body').addClass('nonepadding');
    this.token = this.activatedRoute.snapshot.queryParams["token"];
    this.email = this.activatedRoute.snapshot.queryParams["email"];

    let data = { email: this.email, token: this.token };
    this.userService.activeuser(data).subscribe(
      response => {
        this.msg = response.msg;
        if (response.status)
          this.successfullyactive = true;
        else
          this.successfullyactive = false;
      },
      error => {

      }
    )
  }

}
