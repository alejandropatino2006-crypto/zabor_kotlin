import { Component, OnInit } from '@angular/core';
import Swal from 'sweetalert2';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import * as Swaldata from '../../../../shared/helpers/swalFunctionsData';
import { NgxSpinnerService } from 'ngx-spinner';
import { RestaurantService } from '../../../../shared/services/frontServices/restaurant.service';
declare var $: any;
import { cityLists } from './../../../helpers/commonFunctions';
import { from } from 'rxjs';

@Component({
  selector: 'app-searchbanner',
  templateUrl: './searchbanner.component.html',
  styles: ['.search-dropdown{background: #fff; border-radius: 0px;margin-top: -1em;}', '.search-dropdown{position:absolute}', '.suggest-item{cursor: pointer;}']
})
export class SearchbannerComponent implements OnInit {
  public searchValue: string;
  public categories: Array<any>;
  public ShowFilter: boolean = false;
  public suggestedRes: any = [];
  public cityLists: any = cityLists
  public city: string = ""

  constructor(private router: Router, public restaurantService: RestaurantService, private spinner: NgxSpinnerService, private translate: TranslateService) {
    this.categories = []
  }

  ngOnInit() {
    this.searchValue = ""
    // this.spinner.show();
  }

  search() {
    this.ShowFilter = false;
    this.router.navigate(['/restaurants'], { queryParams: { search: this.searchValue.trim(), city: this.city } });
    // console.log(this.city)
    // if (this.searchValue.trim() != '')
    //   this.router.navigate(['/restaurants'], { queryParams: { search: this.searchValue.trim(), city: this.city } });
    // else
    //   Swal.fire(Swaldata.SwalErrorToast('Please enter restaurant '));
  }

  suggestionclick(value) {
    this.searchValue = value
    this.ShowFilter = false
  }

  onKeyUp(e) {
    if (e.code == "Enter") {
      this.search()
    }

    this.suggestedRes = []
    if (this.searchValue.trim().length < 1)
      return;
    this.restaurantService.autoSearch(this.searchValue.trim()).subscribe(
      data => {
        if (data.status) {
          this.suggestedRes = [...data.data]
        }
      }
    )
  }

  focusFunction() {
    // alert('focus')
    this.ShowFilter = true
  }

  focusOutFunction() {
    // console.log('out')
    // this.ShowFilter = false;
    // this.suggestedRes = []
    // // alert('not focus')
  }
}
