import { Component, OnInit } from '@angular/core';
import { RestaurantService } from './../../../../shared/services/restaurant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { Router, ActivatedRoute } from '@angular/router';
import { environment } from 'src/environments/environment';
import Swal from 'sweetalert2';
import * as Swaldata from './../../../../shared/helpers/swalFunctionsData';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styles: ['.btn-div{padding:10px}', '.detailcard .menus{border-top: 1px solid #e8e0e0;}', '.detailcard .menus:first-child {border-top: none !important;}'],
})
export class MenuComponent implements OnInit {
  restaurantId: number;
  groupList: any;
  groupID: any;
  detailGroupName: any;
  detailGroupMenuitems: any;
  itemImagePath: string = environment.fileurl + '/';
  showdetailsection: boolean = false

  constructor(private route: ActivatedRoute, private _router: Router, private spinner: NgxSpinnerService, private restaurantService: RestaurantService) { }

  ngOnInit() {
    this.spinner.show();
    //get restaurant id
    this.restaurantId = parseInt(this.route.snapshot.paramMap.get("id"));

    //get menu group list
    this.restaurantService.getgroupsofMenu(this.restaurantId).subscribe(
      data => {
        if (data.status == 200) {
          this.groupList = data.data;
        } else {
          Swal.fire(Swaldata.SwalErrorToast(data.msg));
        }

      }, error => {
        Swal.fire(Swaldata.SwalErrorToast('Something went wrong!'));
        this._router.navigate(['/restaurants']);

      }
    ).add(() => {
      this.spinner.hide();
    });

  }

  detailGroup(gid) {
    this.groupID = gid;
    this.spinner.show();
    this.showdetailsection = true;
    this.restaurantService.getGroup(this.restaurantId, this.groupID).subscribe(
      response => {
        if (response.status) {
          this.detailGroupName = response.group.group_name;
          this.detailGroupMenuitems = response.menuitems;
        } else {
          Swal.fire(Swaldata.SwalErrorToast(response.msg));
        }
      }, error => {
        Swal.fire(Swaldata.SwalErrorToast(error));
      }
    ).add(() => {
      this.spinner.hide()
    })
  }


}
