import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
    selector: 'app-layout',
    templateUrl: './layout.component.html',
    styleUrls: []
})
export class LayoutComponent implements OnInit, OnDestroy {

    collapedSideBar: boolean;

    constructor() {
        $('body').addClass('home');
    }

    ngOnInit() {

    }

    receiveCollapsed($event) {
        this.collapedSideBar = $event;
    }

    ngOnDestroy() {
        $('body').removeClass('home');
    }
}
