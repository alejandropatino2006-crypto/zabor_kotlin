import { Component, OnInit } from '@angular/core';


@Component({
  selector: 'app-not-found-component',
  templateUrl: './not-found-component.component.html',
  styleUrls: ['./not-found-component.component.scss']
})
export class NotFoundComponentComponent implements OnInit {

  is_admin: boolean = false;
  constructor() { }

  ngOnInit() {
    //get user from localstorage
    let currentUser = localStorage.getItem('currentuser');
    if (currentUser !== null && JSON.parse(currentUser).user.role && JSON.parse(currentUser).user.role == 'admin')
      this.is_admin = true;


  }

}
