import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
declare var $: any;

@Component({
  selector: 'app-offers',
  templateUrl: './offers.component.html',
  styleUrls: ['./offers.component.scss']
})
export class OffersComponent implements OnInit {
  @Input() offers: Array<any>;
  @Input() showApply: any
  @Output() childEvent = new EventEmitter();

  terms: any = ""
  selectedOfferId: any = -1

  constructor() { }

  ngOnInit() {
  }

  selectedOffer(e) {
    this.childEvent.emit(e);
  }

  updateOffer(id) {
    this.selectedOfferId = id
  }

  getTerms(dis_condition) {
    this.terms = dis_condition
    $('#termsmodal').modal('show')
  }
}
