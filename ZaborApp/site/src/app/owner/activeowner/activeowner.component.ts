import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { UserService } from 'src/app/shared/services/user.service';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-activeowner',
  templateUrl: './activeowner.component.html',
  styleUrls: ['./activeowner.component.scss']
})
export class ActiveOwnerComponent implements OnInit {
  token: string;
  email: string;
  successfullyactive: boolean;
  msg = '';

  constructor(private userService: UserService, private activatedRoute: ActivatedRoute) { }

  ngOnInit() {
    $('body').addClass('nonepadding');
    this.token = this.activatedRoute.snapshot.queryParams["token"];
    this.email = this.activatedRoute.snapshot.queryParams["email"];

    const postData = { email: this.email, token: this.token };
    this.userService.activeuser(postData).subscribe(
      data => {
        this.msg = data.msg;
        this.successfullyactive = !!data.status;
      },
      error => {

      }
    );
  }

}
