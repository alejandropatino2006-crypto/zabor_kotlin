import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-restaurant-div',
  templateUrl: './restaurant-div.component.html',
  styles: ['.restaurant-content h5{ color:#222238 }']
})
export class RestaurantDivComponent implements OnInit {
  @Input() resid: number;
  @Input() respic: string;
  @Input() resname: string;
  @Input() resaddress: string;
  @Input() isAvail: number;
  @Input() claimed: number;
  @Input() distance: number;

  constructor(public router: Router) {

  }

  ngOnInit() {
  }

}
