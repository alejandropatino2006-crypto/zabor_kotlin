import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  templateUrl: './orders.component.html',
})
export class OrdersComponent implements OnInit {
  public restaurantId: number;
  constructor(private route: ActivatedRoute, ) { }

  ngOnInit() {
    //get restaurant id 
    this.restaurantId = parseInt(this.route.snapshot.paramMap.get("id"));

  }

}
