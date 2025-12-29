import { Component, OnInit, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
declare var $: any;
import { UserService } from '../../../../shared/services/frontServices/user.service';
import { TranslationService } from '../../../../shared/services/translation.service';
import { RestaurantService } from '../../../../shared/services/frontServices/restaurant.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { NgxSpinnerService } from 'ngx-spinner';
import Swal from 'sweetalert2';
import * as Swaldata from '../../../../shared/helpers/swalFunctionsData';
import {AuthenticationService} from '../../../../shared/services/authentication.service';
import {ClientStorageService} from '../../../../shared/services/client-storage.service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {

    public pushRightClass: string;
    public currentuser;
    public isLoggedIn: boolean = false;
    public loggedInUserType: string = "";
    public imagepath: string
    searchValue: any = "";
    suggestedRes: any[];
    ShowFilter: boolean = false
    constructor(
        private translate: TranslateService,
        public usersService: UserService,
        public restaurantservice: RestaurantService,
        private route: Router,
        public translation: TranslationService,
        private spinner: NgxSpinnerService,
        private router: Router,
        private _auth: AuthenticationService,
        private clientStorage: ClientStorageService
    ) {
        // if (localStorage.getItem('token') && localStorage.getItem('currentUserId') && parseInt(localStorage.getItem('currentUserId')) > 0)
        if (this.clientStorage.retrieveToken() != null && localStorage.getItem('currentUserId') && parseInt(localStorage.getItem('currentUserId')) > 0)
            this.isLoggedIn = true;
        if (localStorage.getItem('currentuser'))
            this.loggedInUserType = JSON.parse(localStorage.getItem('currentuser')).user.role;
    }

    ngOnInit() {
        this.usersService.Setuserdata()
        this.imagepath = environment.fileurl + '/'
        // $('select').niceSelect();
        $(window).scroll(function () {
            var scroll = $(window).scrollTop();
            if (scroll >= 10) {
                $(".scroll-top").addClass("show");
                $(".site-header").addClass("sticky");
            } else {
                $(".scroll-top").removeClass("show");
                $(".site-header").removeClass("sticky");
            }
        });

        $(".scroll-top").click(function () {
            $("html, body").animate({
                scrollTop: 0
            }, "slow");
            return false;
        });

        if (!localStorage.getItem('lat'))
            this.route.navigate(['/']);
    }

    openMenuMobile() {
        $('body').removeClass('open');
        $('#navbarSupportedContent').removeClass('show');
    }
    showCart() {
        if (this.restaurantservice.cart.cart.length > 0) {
            $('.caetsec').toggleClass('show');
            $('body').toggleClass('open-cart');
        }
    }

    navbarToggle() {
        $('body').toggleClass('open');
    }

    logout() {
        this._auth.logout();
    }

    showManu(id) {
        $('.caetsec').toggleClass('show');
        $('body').toggleClass('open-cart');

        this.router.navigate(['menu', id]);
    }

    search() {
        this.ShowFilter = false
        if (this.searchValue.trim() != '') {
            this.router.navigate(['/restaurants'], { queryParams: { search: this.searchValue.trim() } });
        } else
            Swal.fire(Swaldata.SwalErrorToast('Please enter restaurant '));
    }
    // setLocalstorageRes(value) {
    //     console.log(localStorage.getItem('res'))
    //     if (localStorage.getItem('res')) {
    //         let resSearch = [...JSON.parse(localStorage.getItem('res'))].shift()
    //         console.log(resSearch)
    //         localStorage.setItem('res', JSON.stringify(resSearch.unshift(value)))
    //     }
    //     else
    //         localStorage.setItem('res', JSON.stringify([value, value]))
    // }
    // getLocalstorage() {
    //     console.log(JSON.parse(localStorage.getItem('res')))
    //     if (localStorage.getItem('res'))
    //         return [...JSON.parse(localStorage.getItem('res'))].slice(0, 5)
    //     else
    //         []
    // }

    openSearch() {
        this.searchValue = ""
        this.suggestedRes = [];
    }

    onKeyUp(e) {
        this.ShowFilter = true
        if (e.code == "Enter") {
            this.search()
        }

        this.suggestedRes = []
        if (this.searchValue.trim().length < 1)
            return;
        this.restaurantservice.autoSearch(this.searchValue.trim()).subscribe(
            data => {
                if (data.status) {
                    this.suggestedRes = [...data.data]
                }
            }
        )
    }

    clearCart() {
        //clear cart and remove from database
        $('.caetsec').removeClass('show');
        $('body').removeClass('open-cart');
        this.spinner.show();

        this.restaurantservice.clearCart().subscribe(
            data => {
                if (data.status) {
                    this.restaurantservice.cart = []
                    $('.caetsec').toggleClass('hide');
                }
            }
        ).add(() => {
            this.spinner.hide();
            this.router.navigate(['offers']);
        })
    }
}
