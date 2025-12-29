import { Component, OnInit } from '@angular/core';
import { routerTransition } from 'src/app/router.animations';
import { adminService } from './../../../shared/services/admin.service';
import { environment } from 'src/environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';


@Component({
    selector: 'app-dashboard',
    templateUrl: './dashboard.component.html',
    styleUrls: ['./dashboard.component.scss'],
    animations: [routerTransition()]
})
export class DashboardComponent implements OnInit {
    public dashboardData: any = {
        users: "",
        restaurant: "",
        category: "",
        feedback: ""
    }

    public notifications: Array<any> = [];
    public fileurl: string = environment.fileurl;
    public page: number = 1;
    public showmorebutton: boolean = true;

    constructor(private adminservices: adminService, private spinner: NgxSpinnerService) {

    }

    ngOnInit() {
        this.adminservices.dashboard().subscribe(
            data => {
                this.dashboardData = data.resp;
            },
            error => {

            }
        )
        this.morenotifiacations();
    }

    morenotifiacations() {
        this.spinner.show();
        this.adminservices.getnotifications(this.page).subscribe(
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
