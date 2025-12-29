import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { RestaurantService } from '../../../shared/services/frontServices/restaurant.service';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../shared/helpers/swalFunctionsData';
import { TranslateService } from '@ngx-translate/core';
import { TranslationService } from '../../../shared/services/translation.service';


@Component({
  selector: 'app-pages',
  templateUrl: './pages.component.html',
  styles: ['.sec{padding:60px 0px}']
})
export class PagesComponent implements OnInit, OnDestroy {

  public page: number;
  public data: any = []
  public Routersubscription: any;

  // tslint:disable-next-line:max-line-length
  constructor(public translation: TranslationService, private _route: Router, private route: ActivatedRoute, private restaurantService: RestaurantService, private spinner: NgxSpinnerService, private translate: TranslateService) { }

  ngOnInit() {
    // tslint:disable-next-line:max-line-length
    this.page = (!isNaN(parseInt(this.route.snapshot.paramMap.get("id"))) && parseInt(this.route.snapshot.paramMap.get("id")) > 0 && parseInt(this.route.snapshot.paramMap.get("id")) < 6) ? parseInt(this.route.snapshot.paramMap.get("id")) : 1;
    this.getPageContent();
    this.routeEvent(this._route)
  }


  getPageContent() {
    this.spinner.show();
    this.restaurantService.getStaticPages(this.page).subscribe(
      data => {
        if (data.status) {
          this.data = data.data.resp[0]
          //this.content = "Asdfasdf";
        }
      },
      error => {

        Swaldata.SwalErrorToast('Something went wrong')
      }
    ).add(() => {
      this.spinner.hide();
    })
  }

  routeEvent(router: Router) {

    this.Routersubscription = router.events.subscribe(e => {

      if (e instanceof NavigationEnd) {
        // tslint:disable-next-line:max-line-length
        this.page = (!isNaN(parseInt(this.route.snapshot.paramMap.get("id"))) && parseInt(this.route.snapshot.paramMap.get("id")) > 0 && parseInt(this.route.snapshot.paramMap.get("id")) < 6) ? parseInt(this.route.snapshot.paramMap.get("id")) : 1
        this.getPageContent();
      }
    });
  }

  ngOnDestroy() {
    this.Routersubscription.unsubscribe()
  }

}
