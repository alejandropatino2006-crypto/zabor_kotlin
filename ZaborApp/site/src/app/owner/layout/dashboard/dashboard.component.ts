import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { UserService } from '../../../shared/services/user.service';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [routerTransition()]
})
export class DashboardComponent implements OnInit {
    public dashboardData: any = {
        restaurant: "",
        advert: "",
        promovideo: ""
    }

    public notifications: Array<any> = [];
    public fileurl: string = environment.fileurl;
    public page: number = 1;
    public showmorebutton: boolean = true;


    constructor(private userservices: UserService, private spinner: NgxSpinnerService) {


    }

    ngOnInit() {
        this.spinner.show();
        this.userservices.dashboard().subscribe(
            data => {
                this.dashboardData = data.resp;

            },
            error => {

            }
        ).add(() => {
            this.spinner.hide();
        })

        this.morenotifiacations();
    }


    morenotifiacations() {
        this.spinner.show();
        this.userservices.getnotifications(this.page).subscribe(
            data => {
                if (data.status) {
                    if (data.response.length < 20)
                        this.showmorebutton = false;
                    data.response.map(item => {
                        this.notifications.push(item);
                    })
                }
                this.page += 1;
            },
            err => {

            }
        ).add(() => {
            this.spinner.hide();
        })
    }

}
