import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-tr-label',
  templateUrl: './tr-label.component.html',
  styleUrls: ['./tr-label.component.scss']
})
export class TrLabelComponent implements OnInit {

  @Input() labelText: string;
  @Input() required: boolean = false;
  @Input() class: string | null = null;
  @Input() style: string | null = null;
  @Input() for: string | null = null;
  @Input() doubleLine: boolean = false;
  @Input() serialNumber: number | null = null;

  constructor() { }

  ngOnInit(): void {
    if (this.doubleLine) {
      this.class = this.class == null || this.class.length == 0 ? 'double-line' : this.class + 'double-line';
    }
  }

}
