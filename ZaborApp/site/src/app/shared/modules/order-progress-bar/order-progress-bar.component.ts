import { Component, OnInit, Input } from '@angular/core';
import { RestaurantService } from './../../../shared/services/frontServices/restaurant.service'
import { TranslatePipe } from '@ngx-translate/core';

@Component({
  selector: 'app-order-progress-bar',
  templateUrl: './order-progress-bar.component.html',
  styleUrls: ['./order-progress-bar.component.css']
})
export class OrderProgressBarComponent implements OnInit {

  @Input() order_id: number
  @Input() delivery_mode: number
  public showSpinner: boolean = true;
  public AllOrderStatus;
  public orderCompleteStages: Array<any> = [];
  public orderCompleteStagesNames: Array<any> = [];
  public isDelivered: boolean = false;
  public cooking_time: any = ''

  constructor(private restaurantService: RestaurantService) { }

  ngOnInit() {
    if (this.order_id < 0)
      return;

    this.getorderstatusProgress()
  }

  getorderstatusProgress() {
    //get all order stages 
    this.restaurantService.getOrderStages(this.order_id, localStorage.getItem('currentUserId') ? localStorage.getItem('currentUserId') : -1).subscribe(
      data => {
        if (data.status) {
          if (this.delivery_mode == 2)
            this.AllOrderStatus = ['received', 'preparing', 'ready', 'pickup', 'delivered']
          else
            this.AllOrderStatus = ['received', 'preparing', 'ready', 'delivered']

          this.orderCompleteStages = [...data.data]
          data.data.forEach(element => {
            this.orderCompleteStagesNames = [...this.orderCompleteStagesNames, element.status]
            if (element.status == 'delivered')
              this.isDelivered = true;
            if (element.status == 'preparing')
              this.cooking_time = element.cooking_time
          });
        }
      },
      err => {
      }
    ).add(() => {
      this.showSpinner = false
    })
  }

  getFormattedTime(value) {
    let formattedTime = ''
    this.orderCompleteStages.forEach(e => {
      if (e.status == value) {
        if (e.timediff != '') {
          formattedTime = e.created_time
          // let temp = e.timediff.split(':');
          // if (temp[0] != '00')
          //   formattedTime += temp[0] + 'h '
          // if (temp[1] != '00')
          //   formattedTime += temp[1] + 'm '
        }
      }
    })
    return formattedTime
  }
}
