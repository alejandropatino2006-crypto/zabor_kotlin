import { Component, OnInit } from '@angular/core';
import { adminService } from "../../../../shared/services/admin.service";
import { NgxSpinnerService } from "ngx-spinner";
import { ActivatedRoute } from '@angular/router';
import { environment } from "../../../../../environments/environment";

@Component({
  selector: 'app-view',
  templateUrl: './view.component.html'
})
export class ViewComponent implements OnInit {

  driver_id: number;
  driverDetail: any = [];
  fileurl: string;

  constructor(private spinner: NgxSpinnerService, private route: ActivatedRoute, private adminsService: adminService) { }

  ngOnInit() {
    this.fileurl = environment.fileurl;
    this.driver_id = parseInt(this.route.snapshot.paramMap.get("id"));
    this.spinner.show()
    this.adminsService.getdriverDetail(this.driver_id).subscribe(
      data => {
        if (data.status) {
          this.driverDetail = data.data
        }
      },
      err => {

      }
    ).add(() => {
      this.spinner.hide()
    })
  }

}
